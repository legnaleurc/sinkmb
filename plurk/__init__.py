from django.core.urlresolvers import reverse
from django.conf import settings
from django.template.loader import render_to_string
from django.template import RequestContext
from plurk_oauth.PlurkAPI import PlurkAPI

from plurk.models import Access, RealID

CONSUMER_KEY = settings.SERVICES['plurk']['CONSUMER_KEY']
CONSUMER_SECRET = settings.SERVICES['plurk']['CONSUMER_SECRET']

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
			'label': 'Connect to Plurk',
			'uri': reverse( 'plurk.views.connect' ),
		}
	return {
		'label': 'Manage Plurk',
		'uri': reverse( 'plurk.views.manage' ),
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
	return render_to_string( 'plurk.html', {
		'accessible': accessible,
	}, context_instance = context )

from main import services
services['plurk'] = {
	'entrance': getEntrance,
	'head': getHead,
}
