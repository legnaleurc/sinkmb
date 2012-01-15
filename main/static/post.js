( function() {

	function Post( data, srv ) {
		this.srv = srv;
		this.data = data;
		this.realID = null;
		this.widget = null;
		this.cleanedContent = null;
		this.timestamp = new Date( data.timestamp );
		this.similar = false;
	}

	Post.prototype.inDOM = function() {
		return this.widget !== null;
	};

	Post.prototype.getWidget = function() {
		if( this.widget === null ) {
			this.widget = this.srv.renderPost( this.data );
			this.widget.data( 'timestamp', this.timestamp );
		}
		return this.widget;
	};

	Post.prototype.getService = function() {
		return this.srv;
	};

	Post.prototype.getRealID = function() {
		return this.realID;
	};

	Post.prototype.getCleanedContent = function() {
		return this.cleanedContent;
	};

	Post.prototype.getTimestamp = function() {
		return this.timestamp;
	};

	Post.prototype.isSimilar = function() {
		return this.similar;
	};

	Post.prototype.setSimilar = function( similar ) {
		this.similar = similar;
	};

	SinKMB.Post = Post;

} )();
