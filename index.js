var rest = require('superagent');
var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');

var triggers = require('./lib/triggers');

function KeenApi(config) {
	if (!config) {
		throw new Error("The 'config' parameter must be specified and must be a JS object.");
	}
	if (!config.projectId) {
		throw new Error("The 'config' object must contain a 'projectId'.");
	}

	this.projectId = config.projectId;
	this.writeKey = config.writeKey;
	this.readKey = config.readKey;
	this.masterKey = config.masterKey;
	this.baseUrl = config.baseUrl || 'https://api.keen.io/';
	this.apiVersion = config.apiVersion || '3.0';

	this._flushOptions = _.extend({
		atEventQuantity: 20,
		afterTime: 10000, 
		maxQueueSize: 10000,
		timerInterval: 10000
	}, config.flush || {})

	this._triggers = triggers;
	this._queue = [];
	this._lastFlush = new Date(0);

	var baseUrl = this.baseUrl;
	var apiVersion = this.apiVersion;

	var self = this;
	var request = {
		get: function(apiKey, path, callback) {
			rest
				.get(baseUrl + apiVersion + path)
				.set('Authorization', apiKey)
				.end(function(err, res) {
					processResponse(err, res, callback);
				});
		},
		post: function(apiKey, path, data, callback) {
			data = data || {};
			rest
				.post(baseUrl + apiVersion + path)
				.set('Authorization', apiKey)
				.set('Content-Type', 'application/json')
				.send(data)
				.end(function(err, res) {
					processResponse(err, res, callback);
				});
		},
		del: function(apiKey, path, callback) {
			rest
				.del(baseUrl + apiVersion + path)
				.set('Authorization', apiKey)
				.set('Content-Length', 0)
				.end(function(err, res) {
					processResponse(err, res, callback);
				});
		},
		queuePost: function(apiKey, path, data, callback) {
			data = data || {};
			var promise = rest
				.post(baseUrl + apiVersion + path)
				.set('Authorization', apiKey)
				.set('Content-Type', 'application/json')
				.send(data);

			var requestData = {
				data: data,
				promise: promise,
				callback: callback
			};
			
			self._enqueue(requestData);

			return promise;
		}
	};

	// Handle logic of processing response, including error messages
	// The error handling should be strengthened over time to be more meaningful and robust
	function processResponse(err, res, callback) {
		callback = callback || function() {};

		if (res && !res.ok && !err) {
			var is_err = res.body && res.body.error_code;
			err = new Error(is_err ? res.body.message : 'Unknown error occurred');
			err.code = is_err ? res.body.error_code : 'UnknownError';
		}

		if (err) return callback(err);
		return callback(null, res.body);
	}

	// Public Methods

	this.projects = {
		list: function(callback) {
			request.get(this.masterKey, '/projects', callback);
		},
		view: function(projectId, callback) {
			request.get(this.masterKey, '/projects/' + projectId, callback);
		}
	};

	this.events = {
		list: function(projectId, callback) {
			request.get(this.masterKey, '/projects/' + projectId + '/events', callback);
		},
		insert: function(projectId, events, callback) {
			events = events || [];
			var data = {};
			events.forEach(function(event) {
				var collection = event.collection;
				if (typeof data[collection] == 'undefined') {
					data[collection] = [];
				}
				var item = (event.data || {});
				if (typeof event.keen == 'object') {
					item.keen = event.keen;
				}
				data[collection].push(item);
			});
			request.post(this.writeKey, '/projects/' + projectId + '/events', data, callback);
		}
	};

	this.properties = {
		view: function(projectId, collection, property, callback) {
			request.get(this.masterKey, '/projects/' + projectId + '/events/' + collection + '/properties/' + property, callback);
		},
		remove: function(projectId, collection, property, callback) {
			request.del(this.masterKey, '/projects/' + projectId + '/events/' + collection + '/properties/' + property, callback);
		}
	};

	this.collections = {
		view: function(projectId, collection, callback) {
			request.get(this.masterKey, '/projects/' + projectId + '/events/' + collection, callback);
		},
		remove: function(projectId, collection, callback) {
			request.del(this.masterKey, '/projects/' + projectId + '/events/' + collection, callback);
		}
	};

	this.request = function(method, keyType, path, params, callback) {
		method = typeof method === 'string' && method.toLowerCase();
		keyType += 'Key';
		callback = callback || (typeof params === 'function') && params;

		if (typeof path === 'string') {
			path = '/projects/' + this.projectId + '/' + path.replace(/^\//,'');
		} else {
			throw new Error('\'path\' must be a string.');
		}

		if (params && typeof params !== 'function') {
			path += '?' + qs.stringify(params);
		}

		if ( ! request.hasOwnProperty(method)) {
			throw new Error('Method must be of type: GET/POST/DEL');
		}

		if (!this.hasOwnProperty(keyType)) {
			throw new Error('Key must be of type: master/write/read');
		}

		if (!this[keyType]) {
			throw new Error('You must specify a nun-null, non-empty \'' + keyType + '\' in your config object.');
		}

		if(method === 'post') {
			return request.post(this[keyType], path, params, callback);
		}

		request[method](this[keyType], path, callback);
	};

	this.addEvent = function(eventCollection, event, callback) {
		if (!this.writeKey) {
			var errorMessage = "You must specify a non-null, non-empty 'writeKey' in your 'config' object when calling keen.configure()!";
			var error = new Error(errorMessage);
			if (callback) {
				callback(error);
			} else {
				throw error;
			}
			return;
		}

		request.queuePost(this.writeKey, "/projects/" + this.projectId + "/events/" + eventCollection, event, callback);
	};

	this.addEvents = function(events, callback) {
		if (!this.writeKey) {
			var errorMessage = "You must specify a non-null, non-empty 'writeKey' in your 'config' object when calling keen.configure()!";
			var error = new Error(errorMessage);
			if (callback) {
				callback(error);
			} else {
				throw error;
			}
			return;
		}

		request.queuePost(this.writeKey, "/projects/" + this.projectId + "/events", events, callback);
	};

	/**
	 * Enqueues a message onto `this._queue`.
	 * Checks whether it is time to flush, and then flushes if necessary.
	 * @param {Object} requestData Event data to send to Keen.IO.
	 */
	this._enqueue = function (requestData) {
		var enqueued = false;
		if (this._queue.length >= this._flushOptions.maxQueueSize) {
			console.error('KeenClient-Node failed to enqueue the event because the queue is full. ' +
				          'Consider increasing the queue size.')
		} else {
			this._queue.push(requestData);
			this._setTimer();
			enqueued = true;

			if (this._shouldFlush()) {
				this.flush();
			}
		}

		return enqueued;
	};

	/**
	 * Checks whether it is time to flush.
	 */
	this._shouldFlush = function () {
		var self = this,
			shouldFlush;

		shouldFlush = _.reduce(this._triggers, function (shouldFlush, unboundTrigger) {
			return shouldFlush || unboundTrigger.apply(self);
		}, false);

		return shouldFlush;
	};

	/**
	 * Flush the queue. Reduces the queue length by `this._flushOptions.atEventQuantity`.
	 * The queue is only filled up by using request.postQueue() which is currently used by only addEvent() and addEvents().
	 */
	this.flush = function () {
		if (this._queue.length === 0) {
			return false;
		}

        // If the queue length is non-zero, then:
        // create a group by splicing up until `this._flushOptions.atEventQuantity`
        var queueGroup = this._queue.splice(0, this._flushOptions.atEventQuantity);

	    // Do each of the requests in the queue group.
	    _.each(queueGroup, function (e) {
			var promise = e.promise;
			promise.end(function(err, res) {
				processResponse(err, res, e.callback);
			});
	    });

		this._lastFlush = new Date();

		if (this._queue.length === 0) {
			this._clearTimer();
		}

		return true;
	};

	/**
	 * Starts and sets a timer at `this._timer`.
	 * Timer checks whether it should be flushing - generally:
	 * N milliseconds has passed since the last flush or the queue contains events. 
	 * It flushes if this is the case.
	 */
	this._setTimer = function () {
		var self = this;
		if (!this._timer) {
			this._timer = setInterval(function () {
				if (self._shouldFlush.apply(self)) {
					self.flush.apply(self);
				}
			}, this._flushOptions.timerInterval);
		}
	};

	/**
	 * Stops and clears the timer at `this._timer`. Afterwards: no longer checking 
	 * to see whether the queue should be flushed.
	 */
	this._clearTimer = function () {
		if (this._timer) {
			clearInterval(this._timer);
			this._timer = null;
		}
	};
}

function configure(config) {
	return new KeenApi(config);
}

function encryptScopedKey(apiKey, options) {
	var iv = crypto.randomBytes(16);
	var cipher = crypto.createCipheriv("aes-256-cbc", apiKey, iv);
	var jsonOptions = JSON.stringify(options);
	var encryptOutput1 = cipher.update(jsonOptions, "utf8", "hex");
	var encryptOutput2 = cipher.final("hex");
	var ivPlusEncrypted = iv.toString("hex") + encryptOutput1 + encryptOutput2;
	return ivPlusEncrypted;
}

function decryptScopedKey(apiKey, scopedKey) {
	var hexedIv = scopedKey.substring(0, 32);
	var hexedCipherText = scopedKey.substring(32, scopedKey.length);
	var iv = new Buffer(hexedIv, "hex");
	var cipherText = new Buffer(hexedCipherText, "hex");
	var decipher = crypto.createDecipheriv("aes-256-cbc", apiKey, iv);
	var decryptOutput1 = decipher.update(cipherText);
	var decryptOutput2 = decipher.final();
	var decrypted = decryptOutput1 + decryptOutput2;
	return JSON.parse(decrypted);
}

module.exports = {
	configure: configure,
	encryptScopedKey: encryptScopedKey,
	decryptScopedKey: decryptScopedKey
};
