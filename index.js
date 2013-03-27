var rest = require('superagent');
var _ = require('underscore');

function KeenApi(apiKey, opts) {
	var config = {
		base: 'https://api.keen.io/',
		version: '3.0'
	};

	var request = {
		get: function(path, callback) {
			rest
				.get(config.base +  config.version + path)
				.set('Authorization', apiKey)
				.end(function(res) {
					processRespone(res, callback);
				});
		},
		post: function(path, data, callback) {
			rest
				.post(config.base +  config.version + path)
				.set('Authorization', apiKey)
				.set('Content-Type', 'application/json')
				.send(data || {})
				.end(function(res) {
					processRespone(res, callback);
				});
		},
		del: function(path, callback) {
			rest
				.del(config.base +  config.version + path)
				.set('Authorization', apiKey)
				.set('Content-Length', 0)
				.end(function(res) {
					processRespone(res, callback);
				});
		}
	};

	// Handle logic of processing response, including error messages
	// The error handling should be strengthened over time to be more meaningful and robust
	function processRespone(res, callback) {
		callback = callback || function() {};
		if (res.ok) {
			return callback(undefined, res.body);
		}

		var error = typeof res.body == 'object' && typeof res.body.error_code == 'string' ? res.body.error_code : 'UnknownError';
		callback(new Error(error));
	}

	// Public Methods

	this.projects = {
		list: function(callback) {
			request.get('/projects', callback);
		},
		view: function(token, callback) {
			request.get('/projects/' + token, callback);
		}
	};

	this.events = {
		list: function(token, callback) {
			request.get('/projects/' + token + '/events', callback);
		},
		insert: function(token, events, callback) {
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
			request.post('/projects/' + token + '/events', data, callback);
		}
	};

	this.properties = {
		view: function(token, collection, property, callback) {
			request.get('/projects/' + token + '/events/' + collection + '/properties/' + property, callback);
		},
		remove: function(token, collection, property, callback) {
			request.del('/projects/' + token + '/events/' + collection + '/properties/' + property, callback);
		}
	};

	this.collections = {
		view: function(token, collection, callback) {
			request.get('/projects/' + token + '/events/' + collection, callback);
		},
		remove: function(token, collection, callback) {
			request.del('/projects/' + token + '/events/' + collection, callback);
		}
	};
}

function api(apiKey, opts) {
	return new KeenApi(apiKey, opts);
}

module.exports = {
	api: api
};