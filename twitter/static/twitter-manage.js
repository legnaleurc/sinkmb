( function() {

	function loadFollowers( cursor, followers ) {
		jQuery.post( '/twitter/get_followers.cgi', {
			cursor: cursor,
		}, function( data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				// TODO error
				return;
			}
			if( data.length === 0 ) {
				return;
			}

			followers.push( data );
			var select = $( '#id_account' );
			$( data ).each( function() {
				select.append( $( '<option />' ).val( this[0] ).text( this[1] ) );
			} );

			loadFollowers( followers.length, followers );
		}, 'json' );
	}

	$( function() {
		var followers = [];
		loadFollowers( -1, followers );
	} );

} )();
