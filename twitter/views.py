from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
import json
import tweepy

import twitter
from twitter.models import Request, Access, RealID
from twitter.forms import RealIDForm

@login_required
def connect( request ):
	auth = tweepy.OAuthHandler( twitter.CONSUMER_KEY, twitter.CONSUMER_SECRET, callback = 'https://sinkmb.appspot.com/twitter/callback/' )
	# store request token for next step
	uri = auth.get_authorization_url()
	try:
		requestToken = Request.objects.get( user__exact = request.user )
		requestToken.key = auth.request_token.key
		requestToken.secret = auth.request_token.secret
	except Request.DoesNotExist:
		requestToken = Request( user = request.user, key = auth.request_token.key, secret = auth.request_token.secret )
	requestToken.save()

	return redirect( uri )

@login_required
def callback( request ):
	try:
		token = request.GET['oauth_token']
		verifier = request.GET['oauth_verifier']
	except Exception:
		# TODO error page
		return redirect( '/' )
	try:
		requestToken = Request.objects.get( user__exact = request.user )
	except Request.DoesNotExist:
		# TODO error page
		return redirect( '/' )
	auth = tweepy.OAuthHandler( twitter.CONSUMER_KEY, twitter.CONSUMER_SECRET )
	auth.set_request_token( requestToken.key, requestToken.secret )
	requestToken.delete()
	try:
		access = auth.get_access_token( verifier )
	except TweepyError:
		# TODO error page
		return redirect( '/' )
	try:
		record = Access.objects.get( user__exact = request.user )
		record.token = access.key
		record.secret = access.secret
	except Access.DoesNotExist:
		record = Access( user = request.user, key = access.key, secret = access.secret )
		record.save()

	# add real id for user
	api = tweepy.API( auth, secure = True )
	me = api.me()
	try:
		realID = RealID.objects.get( user__exact = request.user, account__exact = me.screen_name )
		realID.name = request.user.username
	except RealID.DoesNotExist:
		realID = RealID( user = request.user, name = request.user.username, account = me.screen_name )
	realID.save()

	return redirect( '/' )

@login_required
def manage( request ):
	if request.method == 'POST':
		form = RealIDForm( user = request.user, data = request.POST, files = request.FILES )
		if form.is_valid():
			form.save()
			return redirect( manage )
	else:
		form = RealIDForm( user = request.user )
	realIDs = RealID.objects.filter( user__exact = request.user )
	realIDs = [ ( row.name, row.account ) for row in realIDs ]
	context = RequestContext( request )
	return render_to_response( 'twitter/templates/manage.html', {
		'realIDs': realIDs,
		'form': form,
	}, context_instance = context )

def __getAPI__( user ):
	try:
		token = Access.objects.get( user__exact = user )
	except Access.DoesNotExist:
		# TODO report error
		raise
	auth = tweepy.auth.OAuthHandler( twitter.CONSUMER_KEY, twitter.CONSUMER_SECRET )
	auth.set_access_token( token.key, token.secret )
	api = tweepy.API( auth, secure = True )
	return api

@login_required
def update( request ):
	try:
		message = request.POST['message']
	except KeyError:
		# TODO handle error
		raise
	api = __getAPI__( request.user )
	api.update_status( message )
	return HttpResponse( json.dumps( True ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def homeTimeline( request ):
	api = __getAPI__( request.user )

	args = {
		'include_entities': True,
	}
	for k in [ 'since_id', 'max_id' ]:
		if k in request.POST:
			args[k] = request.POST[k]
	htl = api.home_timeline( **args )
	tls = []
	for tl in htl:
		try:
			realID = RealID.objects.get( user__exact = request.user, account__exact = tl.author.screen_name )
			realID = realID.name
		except RealID.DoesNotExist:
			realID = None
		tls.append( {
			'service': 'twitter',
			'timestamp': tl.created_at.isoformat(),
			'real_id': realID,

			'text': tl.text,
			'author': tl.author.screen_name,
			'author_display_name': tl.author.name,
			'avatar': tl.author.profile_image_url_https,
			'id_str': tl.id_str,
			'entities': tl.entities,
		} )
	return HttpResponse( json.dumps( tls ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def getFollowers( request ):
	try:
		cursor = int( request.POST['cursor'] )
	except Exception:
		raise
	api = __getAPI__( request.user )

	def chunks( l, n ):
		for i in xrange( 0, len( l ), n ):
			yield l[i:i+n]

	followerIDs = api.me().followers_ids( cursor = cursor )
	followers = []
	for chunk in chunks( followerIDs[0], 100 ):
		followers.extend( api.lookup_users( user_ids = chunk ) )

	followers = [ ( x.screen_name, x.name ) for x in followers ]
	return HttpResponse( json.dumps( followers ), content_type = 'text/plain; charset="utf-8"' )
