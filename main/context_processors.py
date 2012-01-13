from main import services

def entrances( request ):
	if not request.user.is_authenticated():
		return {}
	return {
		'entrances': [ service['entrance']( request.user ) for ( name, service ) in services.iteritems() ],
	}
