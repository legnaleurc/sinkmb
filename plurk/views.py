from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
import json, datetime
from plurk_oauth.PlurkAPI import PlurkAPI

import plurk
from plurk.models import Request, Access, RealID
from plurk.forms import RealIDForm

@login_required
def connect( request ):
	api = PlurkAPI( plurk.CONSUMER_KEY, plurk.CONSUMER_SECRET )
	api._oauth.get_request_token()
	# store request token for next step
	uri = api._oauth.get_verifier_url()
	try:
		requestToken = Request.objects.get( user__exact = request.user )
		requestToken.key = api._oauth.oauth_token['oauth_token']
		requestToken.secret = api._oauth.oauth_token['oauth_token_secret']
	except Request.DoesNotExist:
		requestToken = Request( user = request.user, key = api._oauth.oauth_token['oauth_token'], secret = api._oauth.oauth_token['oauth_token_secret'] )
	requestToken.save()

	return redirect( uri )

@login_required
def callback( request ):
	try:
		requestKey = request.GET['oauth_token']
		verifier = request.GET['oauth_verifier']
	except Exception:
		# TODO error page
		raise
	try:
		requestToken = Request.objects.get( user__exact = request.user )
	except Request.DoesNotExist:
		# TODO error page
		raise
	api = PlurkAPI( plurk.CONSUMER_KEY, plurk.CONSUMER_SECRET )
	api._oauth.oauth_token['oauth_token'] = requestToken.key
	api._oauth.oauth_token['oauth_token_secret'] = requestToken.secret
	requestToken.delete()
	try:
		api._oauth.get_access_token( verifier )
		accessKey = api._oauth.oauth_token['oauth_token']
		accessSecret = api._oauth.oauth_token['oauth_token_secret']
	except Exception:
		# TODO error page
		raise
	try:
		record = Access.objects.get( user__exact = request.user )
		record.key = accessKey
		record.secret = accessSecret
	except Access.DoesNotExist:
		record = Access( user = request.user, key = accessKey, secret = accessSecret )
		record.save()

	# add read id for user
	me = api.callAPI( '/APP/Profile/getOwnProfile' )
	if me == None:
		raise Exception( api.error() )
	me = me['user_info']['nick_name']
	try:
		realID = RealID.objects.get( user__exact = request.user, account__exact = me )
		realID.name = request.user.username
	except RealID.DoesNotExist:
		realID = RealID( user = request.user, name = request.user.username, account = me )
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
	return render_to_response( 'plurk/templates/manage.html', {
		'realIDs': realIDs,
		'form': form,
	}, context_instance = context )

def __getAPI__( user ):
	try:
		token = Access.objects.get( user__exact = user )
	except Access.DoesNotExist:
		# TODO report error
		raise
	api = PlurkAPI( plurk.CONSUMER_KEY, plurk.CONSUMER_SECRET, token.key, token.secret )
	return api

def __timelineToResponse__( user, htl ):
	users = htl['plurk_users']
	tls = []
	for tl in htl['plurks']:
		content = tl['content']
		try:
			qualifier = tl['qualifier_translated']
		except KeyError:
			qualifier = tl['qualifier']
		author = users[unicode(tl['owner_id'])]
		nickName = author['nick_name']
		try:
			displayName = author['display_name']
		except KeyError:
			displayName = nickName
		if author['has_profile_image'] == 0:
			avatar = 'http://www.plurk.com/static/default_medium.gif'
		elif author['avatar'] == None or author['avatar'] == 0:
			avatar = 'http://avatars.plurk.com/{0}-medium.gif'.format( author['id'] )
		else:
			avatar = 'http://avatars.plurk.com/{0}-medium{1}.gif'.format( author['id'], author['avatar'] )
		timestamp = datetime.datetime.strptime( tl['posted'], '%a, %d %b %Y %H:%M:%S %Z' )
		try:
			realID = RealID.objects.get( user__exact = user, account__exact = nickName )
			realID = realID.name
		except RealID.DoesNotExist:
			realID = None
		tls.append( {
			'service': 'plurk',
			'timestamp': timestamp.isoformat(),
			'real_id': realID,

			'content': content,
			'author': nickName,
			'author_display_name': displayName,
			'avatar': avatar,
		} )
	return tls

@login_required
def plurkAdd( request ):
	try:
		message = request.POST['message']
	except Exception:
		# TODO report error
		raise

	api = __getAPI__( request.user )

	result = api.callAPI( '/APP/Timeline/plurkAdd', {
		# NOTE encode by my hand, but this should done by PlurkAPI
		'content': message.encode( 'utf-8' ),
		# TODO customize qualifier
		'qualifier': ':',
#		'limited_to': '',
#		'no_comments': '',
#		'lang': '',
	} )
	if result == None:
		raise Exception( api.error() )
	return HttpResponse( json.dumps( True ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def getPlurks( request ):
	api = __getAPI__( request.user )

	args = {
#		'offset': '',
#		'limit': '20',
#		'filter': '',
#		'favorers_detail': '',
#		'limited_detail': '',
#		'replurkers_detail': '',
	}
	if 'offset' in request.POST:
		args['offset'] = request.POST['offset']
	htl = api.callAPI( '/APP/Timeline/getPlurks', args )
	if htl == None:
		raise Exception( api.error() )
	tls = __timelineToResponse__( request.user, htl )
	return HttpResponse( json.dumps( tls ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def pullPlurks( request ):
	try:
		offset = request.POST['offset']
	except Exception:
		# TODO handle error
		raise

	api = __getAPI__( request.user )

	htl = api.callAPI( '/APP/Polling/getPlurks', {
		'offset': offset,
#		'limit': '20',
#		'favorers_detail': '',
#		'limited_detail': '',
#		'replurkers_detail': '',
	} )
	if htl == None:
		raise Exception( api.error() )
	tls = __timelineToResponse__( request.user, htl )
	return HttpResponse( json.dumps( tls ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def getFollowing( request ):
	api = __getAPI__( request.user )

	args = {}
	if 'offset' in request.POST:
		args['offset'] = request.POST['offset']

	following = api.callAPI( '/APP/FriendsFans/getFollowingByOffset', args )
	if following == None:
		raise Exception( api.error() )
	following = [ ( x['nick_name'], x['display_name'] if 'display_name' in x else x['nick_name'] ) for x in following ]

	return HttpResponse( json.dumps( following ), content_type = 'text/plain; charset="utf-8"' )

@login_required
def getFriends( request ):
	api = __getAPI__( request.user )

	me = api.callAPI( '/APP/Profile/getOwnProfile' )
	if me == None:
		raise Exception( api.error() )

	args = {
		'user_id': me['user_info']['id'],
	}
	if 'offset' in request.POST:
		args['offset'] = request.POST['offset']

	friends = api.callAPI( '/APP/FriendsFans/getFriendsByOffset', args )
	if friends == None:
		raise Exception( api.error() )
	friends = [ ( x['nick_name'], x['display_name'] if 'display_name' in x else x['nick_name'] ) for x in friends ]

	return HttpResponse( json.dumps( friends ), content_type = 'text/plain; charset="utf-8"' )
