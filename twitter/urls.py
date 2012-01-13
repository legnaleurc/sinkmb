from django.conf.urls.defaults import patterns, url

urlpatterns = patterns( '',
	url( r'^connect/$', 'twitter.views.connect' ),
	url( r'^callback/$', 'twitter.views.callback' ),
	url( r'^manage/$', 'twitter.views.manage' ),
	url( r'^update\.cgi$', 'twitter.views.update' ),
	url( r'^home_timeline\.cgi$', 'twitter.views.homeTimeline' ),
	url( r'^get_followers\.cgi$', 'twitter.views.getFollowers' ),
)
