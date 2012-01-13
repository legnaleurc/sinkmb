from django.contrib import admin
from twitter.models import Request, Access, RealID

class RequestAdmin( admin.ModelAdmin ):
	list_display = ( 'user', 'key', 'secret' )

admin.site.register( Request, RequestAdmin )

class AccessAdmin( admin.ModelAdmin ):
	list_display = ( 'user', 'key', 'secret' )

admin.site.register( Access, AccessAdmin )

class RealIDAdmin( admin.ModelAdmin ):
	list_display = ( 'user', 'name', 'account' )

admin.site.register( RealID, RealIDAdmin )
