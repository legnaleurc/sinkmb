( function() {

	/**
	 * @brief Abstract class for services
	 */
	function Service() {
		this.oldPostQueue = [];
		this.pulling = false;
	}

	/**
	 * @brief Render @p data to a jQuery DOM node
	 * @param data The object to render
	 * @return a jQuery object
	 *
	 * The jQuery object MUST have data, which key is 'timestamp', value is a Date object.
	 */
	Service.prototype.renderPost = function( data ) {
		throw new TypeError( 'pure virtual function call' );
	};

	/**
	 * @brief Retrives new posts
	 * @return Service object
	 *
	 * If there is another job exists, this method does nothing.
	 */
	Service.prototype.update = function() {
		if( this.pulling ) {
			return this;
		}
		this.pullNew();
		return this;
	};

	/**
	 * @brief Retrives new posts
	 * @return undefined
	 * @todo Rename this method, this is ambiguous
	 *
	 * This method could be asynchronized.
	 */
	Service.prototype.pullNew = function() {
		throw new TypeError( 'pure virtual function call' );
	};

	/**
	 * @brief Get the top-must (i.e. latest) post
	 * @return Post object, or null if empty
	 *
	 * This method will pull historical post if needed. It will not pull again if already pulling.
	 */
	Service.prototype.topPost = function() {
		if( this.oldPostQueue.length > 0 ) {
			return this.oldPostQueue[0];
		}
		if( !this.pulling ) {
			this.pulling = true;
			this.pullHistory();
		}
		return null;
	};

	/**
	 * @brief Pop the top-must (i.e. latest) post
	 * @return Post object, or null if empty
	 */
	Service.prototype.popPost = function() {
		if( this.oldPostQueue.length > 0 ) {
			return this.oldPostQueue.shift();
		}
		return null;
	};

	Service.prototype.pushPost = function( post ) {
		this.oldPostQueue.push( post );
		return this;
	};

	Service.prototype.pullFinished = function() {
		this.pulling = false;
	};

	Service.prototype.pullHistory = function() {
		throw new TypeError( 'pure virtual function call' );
	};

	SinKMB.AbstractService = Service;

} )();
