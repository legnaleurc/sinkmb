( function() {

	function Service() {
		this.oldPostQueue = [];
		this.pulling = false;
	}

	Service.prototype.renderPost = function( data ) {
		throw new TypeError( 'pure virtual function call' );
	};

	Service.prototype.update = function() {
		if( this.pulling ) {
			return this;
		}
		this.pullNew();
		return this;
	};

	Service.prototype.pullNew = function() {
		throw new TypeError( 'pure virtual function call' );
	};

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
