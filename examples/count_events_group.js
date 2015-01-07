var Keen = require('../index.js');

var client = Keen.configure({
	projectId: "54ac18d7672e6c659d9ec11c",
	writeKey: "89b6a8b5d4d06ef46bc6e6d0a6edb44e6b0b31cd7ee71e16b6732c9845b895e6a53f2777627aefcb57f31675fa53055f4a4300e67ce3f11030beb6cdb24f8da831f8b2de7a385cc5cfbebb625df9f9657409b02b98c75df3df064a6e86645d3e768b14743aa44d4378aebbd7a6af6f7e",
    readKey: "229d093c4469adbfb6b98f661c472091623f96036da7b3306d84d43507140e812733e359fbdb1d3a85dddf14a5a6096e2cff0010dfdfe1237f23832b7db5a26cb833af014cb24a7820f7e1d31045442c43b26fe6aef0a340ebcc3a3aa1a7911f0ed633b2e791011f164f67be0e81a03e"
});

var count = new Keen.Query("count", {
  eventCollection: "log_tag_1_1",
  groupBy: "sensor.location",
  timeframe: "this_7_days"
});

// Send query
client.run(count, function(err, response){
  if (err) return console.log(err);
  console.log(response.result[0],response.result[1]);
});

/*
// Not Yet Implemented

keen.queries.list(projectId, function(err, res) {
	console.log('queries.list', err, res);
});

keen.queries.perform(projectId, collection, 'count', {}, function(err, res) {
	console.log('queries.perform', err, res);
});

keen.queries.extraction(projectId, collection, {}, function(err, res) {
	console.log('queries.extraction', err, res);
});

keen.queries.funnel();

keen.queries.saved.list();

keen.queries.saved.view();

keen.queries.saved.insert();

keen.queries.saved.remove();

keen.queries.saved.results();

*/