from django.core.urlresolvers import reverse
from django.conf import settings
from django.template.loader import render_to_string
from django.template import RequestContext
import tweepy

from twitter.models import Access, RealID

CONSUMER_KEY = settings.SERVICES['twitter']['CONSUMER_KEY']
CONSUMER_SECRET = settings.SERVICES['twitter']['CONSUMER_SECRET']

def getEntrance( user ):
	if not user.is_authenticated():
		return {
			'label': '',
			'uri': '',
		}
	try:
		token = Access.objects.get( user__exact = user )
	except Access.DoesNotExist:
		return {
			'label': 'Connect to Twitter',
			'uri': reverse( 'twitter.views.connect' ),
		}
	return {
		'label': 'Manage Twitter',
		'uri': reverse( 'twitter.views.manage' ),
	}

def getHead( request ):
	accessible = False
	if request.user.is_authenticated():
		try:
			token = Access.objects.get( user__exact = request.user )
			accessible = True
		except Access.DoesNotExist:
			pass
	context = RequestContext( request )
	return render_to_string( 'twitter.html', {
		'accessible': accessible,
	}, context_instance = context )

from main import services
services['twitter'] = {
	'entrance': getEntrance,
	'head': getHead,
}
