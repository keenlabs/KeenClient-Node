# Keen IO - NodeJS

Keen IO is an online service to collect, analyze, and visualize your data.

## Getting Started

`npm install keen.io`

## Examples

### Initialisation

```javascript
var keen = require('keen.io');

// Configure instance with API Key
var api = keen.api('<api_key>');
```

You can also have multiple instances if you are connecting to multiple KeenIO accounts in the one project (probably edge case).

```javascript
var keen = require('keen.io');

// Configure instance with API Key
var api1 = keen.api('<api_key_1>');
var api2 = keen.api('<api_key_2>');
```

In the future there will be the ability to pass options into the initialisation such as batching inserts, etc. The structure of this hasn't been defined yet but will look something like the following.

```javascript
var keen = require('keen.io');

// Configure instance with API Key and options
var api = keen.api('<api_key>', { batchEventInserts: 30 });
```

### Projects Resourcce

```javascript
var keen = require('keen.io');
var api = keen.api('<api_key>');

var token = '<project_token>';

// Get projects list
api.projects.list(function(err, projects) {
	console.log('projects.list', err, projects);
});

// Get single project info
api.projects.view(token, function(err, res) {
	console.log('projects.view', err, res);
});
```

### Events Resourcce

```javascript
var keen = require('keen.io');
var api = keen.api('<api_key>');

var token = '<project_token>';

// Get events in project
api.events.list(token, function(err, res) {
	console.log('events.list', err, res);
});

// Send events to project
var events = [
	{
		collection: 'test',
		data: {
			name: 'Fred',
			age: 30
		},
		keen: {
			timestamp: new Date(0)
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
api.events.insert(token, events, function(err, res) {
	console.log('events.insert', err, res);
});
```

### Properties Resourcce

```javascript
var keen = require('keen.io');
var api = keen.api('<api_key>');

var token = '<project_token>';
var collection = '<event_collection>';
var property = '<property_name>';

api.properties.view(token, collection, property, function(err, res) {
	console.log('properties.view', err, res);
});

// Removes property for all events in collection
api.properties.remove(token, collection, property, function(err, res) {
	console.log('properties.remove', err, res);
});
```

### Collections Resourcce

```javascript
var keen = require('keen.io');
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
```

## Future Updates

Future module updates are planned to introduce the remaining api calls. You can see some of the spec for that in examples/queries.js. Also as mentioned above specifying options when creating an instance to configure the behaviour of the instance (ie, batching event submissions).

## Contributing

Please feel free to contribute, pull requests very welcome. The aim is to build up this module to completely represent the API provided by Keen IO which quite extensive so the more contributions the better.

## Further Reading

Keen IO - Website: https://keen.io/
Keen IO - API Technical Reference: https://keen.io/docs/api/reference/

## Release History

### 0.0.0

- First release.

## License

Licensed under the MIT license.
