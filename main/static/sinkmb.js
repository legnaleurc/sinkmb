var SinKMB = {

	bind: function( fn ) {
		var args = Array.prototype.slice.call( arguments, 1 );
		return function() {
			fn.apply( this, args.concat( Array.prototype.slice.call( arguments ) ) );
		};
	},

	getSimilarity: function(a,b){var c=Math.max(a.length,b.length),d=(function(){var c=null,d=null,e=0,f=0,g=null;for(d=[e=0];a[e];e++)for(c=[f=0];b[++f];)g=d[f]=e?1+Math.min(d[--f],c[f]-(a[e-1]==b[f]),c[++f]=d[f]):f;return g;})();return [d,(c-d)/c];},

	findSimilarPost: function( posts, targetPost ) {
		for( var i = 0; i < posts.length; i += 1 ) {
			var post = posts[i];
			if( post.service === targetPost.service || post.universal_author === null || post.universal_author !== targetPost.universal_author ) {
				// if is not the same author, skip
				continue;
			}
			var similarity = SinKMB.getSimilarity( post.content, targetPost.content );
			if( similarity[1] >= 0.9 ) {
				// TODO tune similarity condition
				return i;
			}
		}
		return -1;
	},

	services: [],

	/// locker for multi-ajax
	semaphore: 0,

	lock: function( count ) {
		if( SinKMB.semaphore !== 0 ) {
			return false;
		}
		SinKMB.semaphore = count;
		return true;
	},

	unlock: function() {
		if( SinKMB.semaphore === 0 ) {
			return;
		}
		SinKMB.semaphore -= 1;
	},

	/**
	 * @brief Update timeline since last updated.
	 */
	updateTimeline: function() {
		if( !SinKMB.lock( SinKMB.services.length ) ) {
			return;
		}
		$( SinKMB.services ).each( function() {
			this.getTimeline( function( post ) {
				SinKMB.manager.insert( post );
			} );
		} );
	},

	moreHistory: function() {
		if( !SinKMB.lock( SinKMB.services.length ) ) {
			return;
		}
		$( SinKMB.services ).each( function() {
			this.getHistory( function( post ) {
				SinKMB.manager.insert( post );
			} );
		} );
	},

};
