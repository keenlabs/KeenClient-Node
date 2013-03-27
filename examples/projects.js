var keen = require('../index.js');

var api = keen.api('<api_key>');
var token = '<project_token>';

// Get projects list
api.projects.list(function(err, projects) {
	console.log('projects.list', err, projects);
});

// Get project info
api.projects.view(token, function(err, res) {
	console.log('projects.view', err, res);
});