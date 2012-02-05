( function() {

	function toOffset( d ) {
		// YYYY-MM-DDTHH:mm:ss in UTC
		return [ d.getUTCFullYear(), '-', d.getUTCMonth() + 1, '-', d.getUTCDate(), 'T', d.getUTCHours(), ':', d.getUTCMinutes(), ':', d.getUTCSeconds() ].join( '' );
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

		var right = $( '<div class="span7" />' );
		var author = $( '<p class="row" />' );
		var nameLabel = $( '<div class="span6" />' ).append( $( '<strong />' ).text( status.author_display_name ) ).append( document.createTextNode( ' ' ) ).append( $( '<small />' ).text( status.author ) );
		var serviceLabel = $( '<div class="span1" />' ).append( $( '<span class="label" />' ).text( 'Plurk' ) );
		right.append( author.append( nameLabel ).append( serviceLabel ) );
		var content = $( '<p />' ).html( status.content );
		right.append( content );
		var timestamp = $( '<p />' ).append( $( '<small />' ).text( ( new Date( status.timestamp ) ).toString() ) );
		right.append( timestamp );

		// find the cleaned content to compare similarity
		status.cleaned_content = content.contents().filter( function() {
			return this.nodeType === 3;
		} ).text();

		return body.append( left ).append( right );
	}

	/// Override
	Plurk.prototype.pullNew = function() {
		jQuery.post( '/plurk/pull_plurks.cgi', {
			offset: toOffset( this.latestTimestamp ),
		}, SinKMB.bind( function( srv, data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				return;
			}
			if( data.length === 0 ) {
				return;
			}

			var tmp = new Date( data[0].timestamp );
			if( srv.latestTimestamp === null || srv.latestTimestamp < tmp ) {
				srv.latestTimestamp = tmp;
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

			var tmp = new Date( data[0].timestamp );
			if( srv.latestTimestamp === null || srv.latestTimestamp < tmp ) {
				srv.latestTimestamp = tmp;
			}
			tmp = new Date( data[data.length - 1].timestamp );
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

	SinKMB.services.push( new Plurk() );

} )();
