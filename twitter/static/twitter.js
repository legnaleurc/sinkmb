( function() {

	function format( tpl ) {
		var ph = Array.prototype.slice.call( arguments, 1 );
		return tpl.replace( /\{(\d+)\}/g, function( p0, p1 ) {
			return ph[parseInt( p1, 10 )];
		} );
	}

	function Twitter() {
		// call super
		SinKMB.AbstractService.apply( this, arguments );

		this.latestStatusID = null;
		this.oldestStatusID = null;
	}
	Twitter.prototype = new SinKMB.AbstractService();
	Twitter.prototype.constructor = Twitter;

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

	/// Override
	Twitter.prototype.pullNew = function() {
		jQuery.post( '/twitter/home_timeline.cgi', {
			since_id: this.latestStatusID,
		}, SinKMB.bind( function( srv, data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				return;
			}
			if( data.length === 0 ) {
				return;
			}

			// update latest status id
			if( srv.latestStatusID === null || data[0].id_str > srv.latestStatusID ) {
				srv.latestStatusID = data[0].id_str;
			}

			$( data ).each( function() {
				SinKMB.timeline.addNewPost( new SinKMB.Post( this, srv ) );
			} );

			SinKMB.timeline.notifyUpdate();
			// NOTE must call
			srv.pullFinished();
		}, this ), 'json' );
	};

	/// Override
	Twitter.prototype.pullHistory = function() {
		var args = {};
		if( this.oldestStatusID !== null ) {
			// exclude because max_id compares less than or equal
			args.max_id = this.oldestStatusID;
			args.exclude_max_id = true;
		}
		jQuery.post( '/twitter/home_timeline.cgi', args, SinKMB.bind( function( srv, data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				return;
			}
			if( data.length === 0 ) {
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
				srv.pushPost( new SinKMB.Post( this, srv ) );
			} );

			// NOTE must call
			srv.pullFinished();
		}, this ), 'json' );
	};

	/// Override
	Twitter.prototype.renderPost = function( status ) {
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

		var timestamp = $( '<p />' ).append( $( '<small />' ).text( ( new Date( status.timestamp ) ).toString() ) );
		right.append( timestamp );

		// find the cleaned content to compare similarity
		status.cleaned_content = content.contents().filter( function() {
			return this.nodeType === 3;
		} ).text();
		return body.append( left ).append( right );
	};

	SinKMB.services.push( new Twitter() );

} )();
