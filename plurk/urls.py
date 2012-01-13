from django.conf.urls.defaults import patterns, url

urlpatterns = patterns( '',
	url( r'^connect/$', 'plurk.views.connect' ),
	url( r'^callback/$', 'plurk.views.callback' ),
	url( r'^manage/$', 'plurk.views.manage' ),
	url( r'^plurk_add\.cgi$', 'plurk.views.plurkAdd' ),
	url( r'^get_plurks\.cgi$', 'plurk.views.getPlurks' ),
	url( r'^pull_plurks\.cgi$', 'plurk.views.pullPlurks' ),
	url( r'^get_following\.cgi$', 'plurk.views.getFollowing' ),
	url( r'^get_friends\.cgi$', 'plurk.views.getFriends' ),
)
