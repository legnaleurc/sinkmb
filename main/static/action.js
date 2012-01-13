$( function() {

	var stdin = $( '#stdin' );
	var wordCounter = $( '#word-counter' );

	// on user submit status
	stdin.keyup( function( event ) {
		var message = jQuery.trim( stdin.val() );
		if( message.length > 140 ) {
			if( !wordCounter.hasClass( 'important' ) ) {
				wordCounter.addClass( 'important' );
			}
		} else if( wordCounter.hasClass( 'important' ) ) {
			wordCounter.removeClass( 'important' );
		}
		wordCounter.text( message.length );

		if( event.which !== 10 && event.which !== 13 ) {
			return;
		}

		$( SinKMB.services ).each( function() {
			this.post( message );
		} );
		// NOTE maybe wait until all done
		stdin.val( '' );
		// TODO retrive posts
		SinKMB.updateTimeline();

		return;
	} );

	// load history on scroll end
	$( window ).scroll( function() {
		var w = $( window ), d = $( document );
		if( w.scrollTop() >= d.height() - w.height() ) {
			SinKMB.moreHistory();
		}
	} );

	// update timeline per minute
	var tid = window.setInterval( SinKMB.updateTimeline, 60 * 1000 );

	// load status first
	SinKMB.updateTimeline();

} );
