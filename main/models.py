from django.db import models
from django.contrib.auth.models import User

# TODO should move to another app

class UserProfile( models.Model ):
	user = models.ForeignKey( User, unique = True )

def createProfile( sender, instance, created, *args, **kwargs ):
	if created:
		UserProfile.objects.create( user = instance )

models.signals.post_save.connect( createProfile, sender = User )

class AbstractRealID( models.Model ):
	class Meta:
		abstract = True

	user = models.ForeignKey( User, related_name = '%(app_label)s_%(class)s_related' )
	name = models.CharField( max_length = 256, null = False )
