( function() {

	function loadFollowers( apiPath, offset ) {
		var args = ( ( offset <= 0 ) ? {} : { offset: offset } );
		jQuery.post( apiPath, args, function( data, textStatus, message ) {
			if( textStatus !== 'success' || data === null ) {
				// TODO error
				return;
			}
			if( data.length === 0 ) {
				return;
			}

			offset += data.length;
			var select = $( '#id_account' );
			$( data ).each( function() {
				select.append( $( '<option />' ).val( this[0] ).text( this[1] ) );
			} );

			loadFollowers( apiPath, offset );
		}, 'json' );
	}

	$( function() {
		var offset = 0;
		loadFollowers( '/plurk/get_friends.cgi', offset );
		offset = 0;
		loadFollowers( '/plurk/get_following.cgi', offset );
	} );

} )();
