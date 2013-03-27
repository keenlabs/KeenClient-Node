var keen = require('../index.js');

var api = keen.api('<api_key>');
var token = '<project_token>';

// Get events in project
api.events.list(token, function(err, res) {
	console.log('events.list', err, res);
});

// Construct same events
var events = [
	{
		collection: 'test',
		data: {
			name: 'Fred',
			age: 30
		},
		keen: {
			timestamp: new Date(0) // overwrite the recorded keen timestamp
		}
	},
	{
		collection: 'test',
		data: {
			name: 'John',
			age: 40
		}
	},
	{
		collection: 'test2',
		data: {
			name: 'John Smith',
			age: 20
		}
	}
];
// Send events to project
api.events.insert(token, events, function(err, res) {
	console.log('events.insert', err, res);
});