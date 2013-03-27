var keen = require('../index.js');

var api = keen.api('<api_key>');
var token = '<project_token>';
var collection = '<event_collection>';
var property = '<property_name>';

// View a single property info
api.properties.view(token, collection, property, function(err, res) {
	console.log('properties.view', err, res);
});

// Removes property for all events in collection
api.properties.remove(token, collection, property, function(err, res) {
	console.log('properties.remove', err, res);
});
