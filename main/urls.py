from django.conf.urls.defaults import patterns, include, url
from django.contrib.auth import views as auth_views

urlpatterns = patterns( '',
	url( r'^$', 'main.views.index' ),
	url( r'^csrftoken\.js$', 'main.views.csrftoken' ),

	# TODO should move to another app
	url( r'^account/register/$', 'main.views.register' ),
	url( r'^account/login/$', auth_views.login, {
		'template_name': 'login.html',
	}, name = 'auth_login' ),
	url( r'^account/logout/$', auth_views.logout, {
		# FIXME reverse of main.views.index
		'next_page': '/',
	}, name = 'auth_logout' ),
)
