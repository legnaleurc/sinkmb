from django.db import models
from django.contrib.auth.models import User

from main.models import AbstractRealID

class Access( models.Model ):
	user = models.ForeignKey( User, related_name = '%(app_label)s_%(class)s_user', unique = True )
	key = models.CharField( max_length = 256, unique = True, null = False )
	secret = models.CharField( max_length = 256, unique = True, null = False )

class Request( models.Model ):
	user = models.ForeignKey( User, related_name = '%(app_label)s_%(class)s_user', unique = True )
	key = models.CharField( max_length = 256, unique = True, null = False )
	secret = models.CharField( max_length = 256, unique = True, null = False )

class RealID( AbstractRealID ):
	account = models.CharField( max_length = 256, null = False )

def cleanUp( sender, instance, *args, **kwargs ):
	try:
		blob = Access.objects.get( user__exact = instance )
		blob.delete()
	except Access.DoesNotExist:
		pass
	try:
		blobs = RealID.objects.filter( user__exact = instance )
		for blob in blobs:
			blob.delete()
	except RealID.DoesNotExist:
		pass

models.signals.pre_delete.connect( cleanUp, sender = User )
