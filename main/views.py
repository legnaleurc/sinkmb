from django.shortcuts import render_to_response, redirect
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.template import RequestContext
from django.http import HttpResponse
import json

from main import services
from main.forms import RegisterForm

def index( request ):
	user = request.user
	context = RequestContext( request )

	if user.is_authenticated():
		heads = []
		if user.is_authenticated():
			for name, service in services.iteritems():
				heads.append( service['head']( request ) )
		return render_to_response( 'index.html', {
			'heads': heads,
		}, context_instance = context )

	if request.method == 'POST':
		form = AuthenticationForm( data = request.POST, files = request.FILES )
		if form.is_valid():
			auth.login( request, form.get_user() )
			return redirect( index )
	else:
		form = AuthenticationForm()
	return render_to_response( 'index.html', {
		'form': form,
	}, context_instance = context )

def csrftoken( request ):
	return render_to_response( 'csrftoken.js', {
	}, context_instance = RequestContext( request ), mimetype = 'text/javascript' )

# TODO should move to another app

def register( request ):
	context = RequestContext( request )

	if request.method == 'POST':
		form = RegisterForm( data = request.POST, files = request.FILES )
		if form.is_valid():
			form.save()
			user = auth.authenticate( username = form.cleaned_data['username'], password = form.cleaned_data['password1'] )
			auth.login( request, user )
			return redirect( index )
	else:
		form = RegisterForm()

	return render_to_response( 'register.html', {
		'form': form,
	}, context_instance = context )
