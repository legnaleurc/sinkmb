from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext as _

import json

class RegisterForm( forms.Form ):
	username = forms.CharField( max_length = 100 )
	password1 = forms.CharField( widget = forms.PasswordInput(), label = u'Password' )
	password2 = forms.CharField( widget = forms.PasswordInput(), label = u'Password (again)' )

	def clean_username( self ):
		try:
			User.objects.get( username__exact = self.cleaned_data['username'] )
		except User.DoesNotExist:
			return self.cleaned_data['username']
		raise forms.ValidationError( _( u'This name has been taken.' ) )

	def clean( self ):
		if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
			if self.cleaned_data['password1'] != self.cleaned_data['password2']:
				raise forms.ValidationError( _( u'You must type the same password each time.' ) )
		return self.cleaned_data

	def save( self ):
		# TODO user input email
		user = User.objects.create_user( username = self.cleaned_data['username'], password = self.cleaned_data['password1'], email = 'aa@bb.cc' )
		user.save()
		profile = user.get_profile()
		profile.save()

		return user
