var keen = require('../index.js');

var api = keen.api('<api_key>');
var token = '<project_token>';
var collection = '<event_collection>';
var property = '<property_name>';

/*
// Not Yet Implemented

api.queries.list(token, function(err, res) {
	console.log('queries.list', err, res);
});

api.queries.perform(token, collection, 'count', {}, function(err, res) {
	console.log('queries.perform', err, res);
});

api.queries.extraction(token, collection, {}, function(err, res) {
	console.log('queries.extraction', err, res);
});

api.queries.funnel();

api.queries.saved.list();

api.queries.saved.view();

api.queries.saved.insert();

api.queries.saved.remove();

api.queries.saved.results();

*/