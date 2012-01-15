( function() {

	function find( posts, post ) {
		var index = -1, similar = false;
		$( posts ).each( function( i ) {
//			if( post.getService() !== this.getService() && post.getRealID() !== null && post.getRealID() === this.getRealID() ) {
//				// test similarity
//				var s = SinKMB.getSimilarity( post.getCleanedContent(), this.getCleanedContent() );
//				if( s[1] > 0.9 ) {
//					// found and stop
//					index = i;
//					similar = true;
//					return false;
//				}
//			}
			if( post.getTimestamp() > this.getTimestamp() ) {
				index = i;
				return false;
			}
		} );
		return {
			index: index,
			similar: similar,
		};
	}

	function Timeline( selector ) {
		this.pendingMore = null;
		this.oldestVisibleIndex = -1;
		this.widget = $( selector );
		this.notifier = $( '#notifier' );
		this.notifierCounter = $( '#notifier-counter' );
		// stores Post objects
		this.posts = [];
		this.newPosts = [];

		this.notifier.click( function() {
			var self = SinKMB.timeline;
			self.notifier.slideUp();
			var nNews = self.newPosts.length;
			self.posts = self.newPosts.concat( self.posts );
			self.newPosts = [];
			self.oldestVisibleIndex += nNews;
			self.show( 0, nNews );
		} );
	}

	Timeline.prototype.update = function() {
		$( SinKMB.services ).each( function() {
			this.update();
		} );
	};

	Timeline.prototype.addNewPost = function( post ) {
		var result = find( this.newPosts, post );
		if( result.index < 0 ) {
			this.newPosts.push( post );
		} else {
			this.newPosts.splice( result.index, 0, post );
		}
		if( result.similar ) {
			post.setSimilar( true );
		}
	};

	Timeline.prototype.notifyUpdate = function() {
		this.notifierCounter.text( this.newPosts.length );
		if( this.newPosts.length !== 0 && this.notifier.is( ':hidden' ) ) {
			this.notifier.slideDown();
		}
	};

	Timeline.prototype.more = function( nPosts, callback ) {
		if( this.pendingMore !== null ) {
			window.clearTimeout( this.pendingMore );
			this.pendingMore = null;
		}

		var notReady = false;
		for( var i = 0; i < nPosts; ++i ) {
			var latestPost = null;
			$( SinKMB.services ).each( function() {
				var post = this.topPost();
				if( post === null ) {
					// not ready, continue
					notReady = true;
					return;
				}
				if( latestPost === null || latestPost.getTimestamp() < post.getTimestamp() ) {
					latestPost = post;
				}
			} );
			if( notReady ) {
				// if any service is not ready, stop and ask again after 0.5s
				this.pendingMore = window.setTimeout( this.more.bind( this, nPosts - i, callback ), 500 );
				return;
			}

			latestPost.getService().popPost();
			this.insert( latestPost );
		}

		callback();
	};

	Timeline.prototype.show = function( begin, nPosts ) {
		if( begin < 0 ) {
			begin = this.oldestVisibleIndex;
		}
		if( this.posts.length < begin + nPosts ) {
			return this;
		}
		for( var i = 0; i < nPosts; ++i ) {
			var post = this.posts[begin + i];
			if( !post.inDOM() ) {
				var widget = post.getWidget();
				// insert into DOM
				var thatWidget = this.findInDom( widget );
				if( thatWidget === null ) {
					this.widget.append( widget );
				} else {
					thatWidget.before( widget );
				}
			}
			if( !post.isSimilar() && !post.getWidget().is( ':visible' ) ) {
				post.getWidget().slideDown();
			}
		}
		if( begin + nPosts > this.oldestVisibleIndex ) {
			this.oldestVisibleIndex = begin + nPosts;
		}
		return this;
	};

	Timeline.prototype.findInDom = function( widget ) {
		var pointer = null, thisDate = widget.data( 'timestamp' );
		this.widget.children().each( function() {
			var thatWidget = $( this );
			var thatDate = thatWidget.data( 'timestamp' );
			if( thisDate > thatDate ) {
				pointer = thatWidget;
				return false;
			}
		} );
		return pointer;
	};

	Timeline.prototype.insert = function( post ) {
		var result = find( this.posts, post );
		if( result.index < 0 ) {
			this.posts.push( post );
		} else {
			this.posts.splice( result.index, 0, post );
		}
		if( result.similar ) {
			post.setSimilar( true );
		}
		return this;
	};

	$( function() {
		SinKMB.timeline = new Timeline( '#stdout' );
	} );

} )();