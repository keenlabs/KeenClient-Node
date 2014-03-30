# Keen IO - NodeJS

[![Build Status](https://travis-ci.org/keenlabs/KeenClient-Node.png?branch=master)](https://travis-ci.org/keenlabs/KeenClient-Node)

Keen IO is an online service to collect, analyze, and visualize your data.

## Getting Started

Use npm to install!

```node
`npm install keen.io`
```

## Examples

### Initialization

```javascript
var keen = require('keen.io');

// Configure instance. Only projectId and writeKey are required to send data.
var keen = keen.configure({
	projectId: "<project_id>",
	writeKey: "<write_key>",
	readKey: "<read_key>",
	masterKey: "<master_key>"
});
```

You can also have multiple instances if you are connecting to multiple KeenIO accounts in the one project (probably edge case).

```javascript
var keen = require('keen.io');

// Configure instance with API Key
var keen1 = keen.configure({...});
var keen2 = keen.configure({...});
```

In the future there will be the ability to pass options into the initialisation such as batching inserts, etc. The structure of this hasn't been defined yet but will look something like the following.

```javascript
var keen = require('keen.io');

// Configure instance with API Key and options
var keen = keen.configure({ 
	projectId: "<project_id>",
	batchEventInserts: 30 
});
```

### Send Events

```javascript
var keen = require("keen.io");
var keen = keen.configure({
	projectId: "<project_id>",
	writeKey: "<write_key>"
});

// send single event to Keen IO
keen.addEvent("my event collection", {"property name": "property value"}, function(err, res) {
	if (err) {
		console.log("Oh no, an error!");
	} else {
		console.log("Hooray, it worked!");
	}
});

// send multiple events to Keen IO
keen.addEvents({
	"my first event collection": [{"property name": "property value"}, ...],
	"my second event collection": [{"property name2": "property value 2"}]
}, function(err, res) {
	if (err) {
		console.log("Oh no, an error!");
	} else {
		console.log("Hooray, it worked!");
	}
});
```

### Generate Scoped Key

```javascript
var keen = require("keen.io");
var apiKey = "YOUR_API_KEY";
var scopedKey = keen.encryptScopedKey(apiKey, {
	"allowed_operations": ["read"],
	"filters": [{
		"property_name": "account.id",
		"operator": "eq",
		"property_value": "123"
	}]
});
var keen = keen.configure({
	projectId: "<project_id>";
	readKey: scopedKey
});
```

## Queries

Analyses are first-class citizens, complete with parameter getters and setters. 

The `<Client>.query` method is available on each configured client instance to run one or many analyses on a given project. Read more about running multiple analyses below.

**Format:**

```
var your_analysis = new Keen.<AnalysisType>(eventCollection, attributes);
```

### Example Usage

```
var Keen = require('keen.io');
var keen = Keen.configure({
  projectId: "your_project_id",
  readKey: "your_read_key"
});

var count = new Keen.Count("pageview", {
  group_by: "property",
  timeframe: "this_7_days"
});

// Send query
keen.query(count, function(err, response){
  if (err) return console.log(err);
  // response.result
});
```


### Analysis Types

`Keen.Count`

`Keen.CountUnique`

`Keen.Sum` requires a `target_property` attribute, where value is an integer

`Keen.Average` requires a `target_property` attribute, where value is an integer

`Keen.Maximum` requires a `target_property` attribute, where value is an integer

`Keen.Minimum` requires a `target_property` attribute, where value is an integer

`Keen.SelectUnique` requires a `target_property` attribute

`Keen.Extraction` 

**A note about extractions:** supply an optional `email` attribute to be notified when your extraction is ready for download. If email is not specified, your extraction will be processed synchronously and your data will be returned as JSON.

`Keen.Funnel` requires a `steps` attribute

**A note about funnels:** funnels require a `steps` as an array of objects. 

```
var funfunfunnel = new Keen.Funnel({
  steps: [
    {
  	  event_collection: "view_landing_page",
  	  actor_property: "user.id"
    },
    {
  	  event_collection: "signed_up",
  	  actor_property: "user.id"
    },
  ],
  timeframe: "this_6_months"
});
```


Learn more about funnels in the [API reference](https://keen.io/docs/data-analysis/funnels/#steps)

### Run multiple analyses at once

The `<Client>.query` method accepts an individual analysis or array of analyses. In the latter scenario, the callback is fired once all requests have completed without error. Query results are then returned in a correctly sequenced array.

Query results are also attached to the query object itself, and can be referenced as `this.data`. 

```
var avg_revenue = new Keen.Average("purchase  ", { 
  target_property: "price",
  group_by: "geo.country" 
});
var max_revenue = new Keen.Maximum("purchase", { 
  target_property: "price",
  group_by: "geo.country" 
});
  
var mashup = keen.query([avg_revenue, max_revenue], function(err, res){
  if (err) return console.log(err);
  // res[0].result or this.data[0] (avg_revenue)
  // res[1].result or this.data[1] (max_revenue)
});  
```


### Get/Set Parameters and Refresh Queries

```
// Based on previous example

// Update parameters
avg_revenue.set({ timeframe: "this_21_days" });
max_revenue.set({ timeframe: "this_21_days" });

// Re-run the query
mashup.refresh();
```



## Future Updates

Future module updates are planned to introduce the remaining API calls. You can see some sketches for these in the [examples directory](https://github.com/keenlabs/KeenClient-Node/blob/master/examples/). Also, as mentioned above, specifying options when creating an instance to configure the behaviour of the instance (ie, batching event submissions).

## Contributing

This is an open source project and we love involvement from the community! Hit us up with pull requests and issues. 

The aim is to build up this module to completely represent the API provided by Keen IO, which is quite extensive. The more contributions the better!

## Further Reading

[Keen IO - Website](https://keen.io/)

[Keen IO - API Technical Reference](https://keen.io/docs/api/reference/)

## Release History

### 0.0.4

- Update dependencies.

### 0.0.3

- Support generating Scoped Keys.

### 0.0.2

- Change error for blank write key.

### 0.0.1

- Add write/read keys.
- Reworked interface - not backwards compatible with 0.0.0!

### 0.0.0

- First release.

## License

Licensed under the MIT license.
