( function() {

	function toOffset( d ) {
		// YYYY-MM-DDTHH:mm:ss in UTC
		return [ d.getUTCFullYear(), '-', d.getUTCMonth() + 1, '-', d.getUTCDate(), 'T', d.getUTCHours(), ':', d.getUTCMinutes(), ':', d.getUTCSeconds() ].join( '' );
	}

	function onPlurksAdded( srv, callback, data, textStatus, message ) {
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
		var tmp = new Date( data[data.length - 1].timestamp );
		if( srv.oldestTimestamp > tmp ) {
			// update oldest timestamp
			srv.oldestTimestamp = tmp;
		}
		$( data ).each( function() {
			this.timestamp = new Date( this.timestamp );
			var widget = renderPost( this );
			callback( {
				data: this,
				widget: widget,
			} );
		} );

		// unlock a semaphore
		SinKMB.unlock();
	}

	function Plurk() {
		// call super
		SinKMB.AbstractService.apply( this, arguments );

		this.latestTimestamp = null;
		this.oldestTimestamp = new Date();
	}
	Plurk.prototype = new SinKMB.AbstractService();
	Plurk.prototype.constructor = Plurk;

	Plurk.prototype.post = function( message ) {
		jQuery.post( '/plurk/plurk_add.cgi', {
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
	Plurk.prototype.renderPost = function( status ) {
		var body = $( '<div class="plurk row" />' );

		var left = $( '<div class="span1" />' );
		var avatar = $( '<a rel="external" />' ).attr( {
			href: 'http://www.plurk.com/' + status.author,
		} ).append( $( '<img />' ).attr( {
			src: status.avatar,
			title: status.author_display_name,
		} ) );
		left.append( avatar );

		var right = $( '<div class="span9" />' );
		var author = $( '<p class="row" />' );
		var nameLabel = $( '<div class="span8" />' ).append( $( '<strong />' ).text( status.author_display_name ) ).append( document.createTextNode( ' ' ) ).append( $( '<small />' ).text( status.author ) );
		var serviceLabel = $( '<div class="span1" />' ).append( $( '<span class="label" />' ).text( 'Plurk' ) );
		right.append( author.append( nameLabel ).append( serviceLabel ) );
		var content = $( '<p />' ).html( status.content );
		right.append( content );
		var timestamp = $( '<p />' ).append( $( '<small />' ).text( status.timestamp.toString() ) );
		right.append( timestamp );

		// find the cleaned content to compare similarity
		status.cleaned_content = content.contents().filter( function() {
			return this.nodeType === 3;
		} ).text();

		return body.append( left ).append( right );
	}

	/// Override
	Plurk.prototype.pullHistory = function() {
		var args = {};
		if( this.oldestTimestamp !== null ) {
			args.offset = this.oldestTimestamp;
		}
		jQuery.post( '/plurk/get_plurks.cgi', args, SinKMB.bind( function( srv, data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				return;
			}
			if( data.length === 0 ) {
				return;
			}

			var tmp = new Date( data[data.length - 1].timestamp );
			if( srv.oldestTimestamp > tmp ) {
				// update oldest timestamp
				srv.oldestTimestamp = tmp;
			}

			$( data ).each( function() {
				srv.pushPost( new SinKMB.Post( this, srv ) );
			} );

			// NOTE must call
			srv.pullFinished();
		}, this ), 'json' );
	};

	Plurk.prototype.getTimeline = function( callback ) {
		if( this.latestTimestamp !== null ) {
			this.pullPlurks( callback );
		} else {
			this.getPlurks( callback );
		}
		// update latest timestamp
		this.latestTimestamp = new Date();
	};

	Plurk.prototype.getHistory = function( callback ) {
		jQuery.post( '/plurk/get_plurks.cgi', {
			offset: toOffset( this.oldestTimestamp ),
		}, SinKMB.bind( onPlurksAdded, this, callback ), 'json' );
	};

	/**
	 * @brief polling plurks
	 */
	Plurk.prototype.pullPlurks = function( callback ) {
		jQuery.post( '/plurk/pull_plurks.cgi', {
			offset: toOffset( this.latestTimestamp ),
		}, SinKMB.bind( onPlurksAdded, this, callback ), 'json' );
	};

	/**
	 * @brief get most recent 20 plurks
	 */
	Plurk.prototype.getPlurks = function( callback ) {
		jQuery.post( '/plurk/get_plurks.cgi', {
		}, SinKMB.bind( onPlurksAdded, this, callback ), 'json' );
	};

	SinKMB.services.push( new Plurk() );

} )();
