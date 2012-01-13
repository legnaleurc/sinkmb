( function() {

	function format( tpl ) {
		var ph = Array.prototype.slice.call( arguments, 1 );
		return tpl.replace( /\{(\d+)\}/g, function( p0, p1 ) {
			return ph[parseInt( p1, 10 )];
		} );
	}

	function renderPost( status ) {
		var body = $( '<div class="twitter row" />' );

		var left = $( '<div class="span1" />' );
		var avatar = $( '<a rel="external" />' ).attr( {
			href: 'https://twitter.com/#!/' + status.author,
		} ).append( $( '<img />' ).attr( {
			src: status.avatar,
			title: status.author_display_name,
		} ) );
		left.append( avatar );

		var tokens = [];
		$( status.entities.media ).each( function() {
			// TODO
		} );
		$( status.entities.urls ).each( function() {
			tokens.push( {
				indices: this.indices,
				token: format( '<a rel="external" href="{0}" title="{1}">{2}</a>', this.url, this.expanded_url, this.display_url ),
			} );
		} );
		$( status.entities.user_mentions ).each( function() {
			tokens.push( {
				indices: this.indices,
				token: format( '<a rel="external" href="https://twitter.com/#!/{0}" title="{1}">@{0}</a>', this.screen_name, this.name ),
			} );
		} );
		$( status.entities.hashtags ).each( function() {
			tokens.push( {
				indices: this.indices,
				token: format( '<a rel="external" href="https://twitter.com/#!/search?%23{0}" title="#{0}">#{0}</a>', this.text ),
			} );
		} );
		tokens.sort( function( l, r ) {
			if( l.indices[0] < r.indices[0] ) {
				return -1
			} else if( l.indices[0] > r.indices[0] ) {
				return 1;
			} else {
				return 0;
			}
		} );
		var index = 0;
		var content = [];
		$( tokens ).each( function() {
			var token = status.text.substring( index, this.indices[0] );
			content.push( token );
			content.push( this.token );
			index = this.indices[1];
		} );
		content.push( status.text.substring( index ) );
		content = content.join( '' );

		var right = $( '<div class="span9" />' );

		var author = $( '<p class="row" />' );
		var nameLabel = $( '<div class="span8" />' ).append( $( '<strong />' ).text( status.author_display_name ) ).append( document.createTextNode( ' ' ) ).append( $( '<small />' ).text( status.author ) );
		var serviceLabel = $( '<div class="span1" />' ).append( $( '<span class="label" />' ).text( 'Twitter' ) );
		right.append( author.append( nameLabel ).append( serviceLabel ) );

		content = $( '<p />' ).html( content );
		right.append( content );

		var timestamp = $( '<p />' ).append( $( '<small />' ).text( status.timestamp.toString() ) );
		right.append( timestamp );

		// find the cleaned content to compare similarity
		status.cleaned_content = content.contents().filter( function() {
			return this.nodeType === 3;
		} ).text();
		return body.append( left ).append( right );
	}

	function onStatusAdded( srv, callback, data, textStatus, message ) {
		if( textStatus !== 'success' || data === null ) {
			// TODO handle error
			SinKMB.unlock();
			return;
		}
		if( data.length === 0 ) {
			// empty timeline, do nothing
			SinKMB.unlock();
			return;
		}
		// update latest status id
		if( srv.latestStatusID === null || data[0].id_str > srv.latestStatusID ) {
			srv.latestStatusID = data[0].id_str;
		}
		// update oldest status id
		if( srv.oldestStatusID === null || data[data.length - 1].id_str < srv.oldestStatusID ) {
			srv.oldestStatusID = data[data.length - 1].id_str;
		}
		$( data ).each( function() {
			this.timestamp = new Date( this.timestamp );
			var widget = renderPost( this );
			callback( {
				data: this,
				widget: widget,
			} );
		} );

		// release lock
		SinKMB.unlock();
	}

	function Twitter() {
		this.latestStatusID = null;
		this.oldestStatusID = null;
	}

	Twitter.prototype.post = function( message ) {
		jQuery.post( '/twitter/update.cgi', {
			message: message,
		}, function( data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				// TODO handle error
				return;
			}
			// TODO report success
		}, 'json' );
	};

	Twitter.prototype.getTimeline = function( callback ) {
		var args = {};
		if( this.latestStatusID !== null ) {
			args.since_id = this.latestStatusID;
		}
		jQuery.post( '/twitter/home_timeline.cgi', args, SinKMB.bind( onStatusAdded, this, callback ), 'json' );
	};

	Twitter.prototype.getHistory = function( callback ) {
		jQuery.post( '/twitter/home_timeline.cgi', {
			max_id: this.oldestStatusID,
		}, SinKMB.bind( onStatusAdded, this, callback ), 'json' );
	};

	SinKMB.services.push( new Twitter() );

} )();
