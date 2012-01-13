from django import forms
from django.utils.translation import ugettext as _

from twitter.models import RealID

class RealIDForm( forms.Form ):
	realID = forms.CharField( label = _( u'Real ID' ) )
	account = forms.CharField( label = _( u'Account' ) )

	def __init__( self, user, *args, **kwargs ):
		super( RealIDForm, self ).__init__( *args, **kwargs )

		self.user = user

	def save( self ):
		try:
			realID = RealID.objects.get( user__exact = self.user, account__exact = self.cleaned_data['account'] )
			realID.name = self.cleaned_data['realID']
		except RealID.DoesNotExist:
			realID = RealID( user = self.user, name = self.cleaned_data['realID'], account = self.cleaned_data['account'] )
		realID.save()
