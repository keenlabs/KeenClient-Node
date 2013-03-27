var keen = require('../index.js');

var api = keen.api('<api_key>');
var token = '<project_token>';
var collection = '<event_collection>';

// Get collection schema
api.collections.view(token, collection, function(err, res) {
	console.log('collection.view', err, res);
});

// Removes collection
// This is irreversible and will only work for collections under 10k events.
api.collections.remove(token, collection, function(err, res) {
	console.log('collection.remove', err, res);
});
