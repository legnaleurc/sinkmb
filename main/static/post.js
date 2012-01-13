( function() {

	function PostManager( selector ) {
		this.widget = $( selector );
		this.posts = [];
	}

	PostManager.prototype.find = function( post ) {
		var index = -1, similar = false;
		$( this.posts ).each( function( i ) {
			if( post.data.service !== this.data.service && post.data.real_id !== null && post.data.real_id === this.data.real_id ) {
				// test similarity
				var s = SinKMB.getSimilarity( post.data.cleaned_content, this.data.cleaned_content );
				if( s[1] > 0.9 ) {
					// found and stop
					index = i;
					similar = true;
					return false;
				}
			}
			if( post.data.timestamp > this.data.timestamp ) {
				index = i;
				return false;
			}
		} );
		return {
			index: index,
			similar: similar,
		};
	};

	PostManager.prototype.insert = function( post ) {
		var result = this.find( post );
		if( this.posts.length === 0 ) {
			this.widget.append( post.widget );
			this.posts.push( post );
		} else if( result.index < 0 ) {
			this.posts[this.posts.length - 1].widget.after( post.widget );
			this.posts.push( post );
		} else if( result.index > 0 ) {
			this.posts[result.index].widget.before( post.widget );
			this.posts.splice( result.index, 0, post );
		} else {
			this.posts[0].widget.before( post.widget );
			this.posts.splice( 0, 0, post );
		}
		post.widget.hide();
		if( !result.similar ) {
			post.widget.slideDown();
		}
		return this;
	};

	$( function() {
		SinKMB.manager = new PostManager( '#stdout' );
	} );

} )();
