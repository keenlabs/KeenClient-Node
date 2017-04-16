var Keen = require('../index.js');

var client = Keen.configure({
	projectId: "54ac18d7672e6c659d9ec11c",
	writeKey: "89b6a8b5d4d06ef46bc6e6d0a6edb44e6b0b31cd7ee71e16b6732c9845b895e6a53f2777627aefcb57f31675fa53055f4a4300e67ce3f11030beb6cdb24f8da831f8b2de7a385cc5cfbebb625df9f9657409b02b98c75df3df064a6e86645d3e768b14743aa44d4378aebbd7a6af6f7e",
    readKey: "229d093c4469adbfb6b98f661c472091623f96036da7b3306d84d43507140e812733e359fbdb1d3a85dddf14a5a6096e2cff0010dfdfe1237f23832b7db5a26cb833af014cb24a7820f7e1d31045442c43b26fe6aef0a340ebcc3a3aa1a7911f0ed633b2e791011f164f67be0e81a03e"
});

var average1min = new Keen.Query("average", {
  eventCollection: "asset_log",
  target_property:"tag.rx_rssi",
  timeframe: "this_1_minute",
  filters:[
    {
        "property_name" : "tag.ibeacon.minor",
        "operator" : "eq",
        "property_value" : 1
    }

    ],
    groupBy: "sensor.location",
  //timeframe: "this_7_days"
});
var average5min = new Keen.Query("average", {
  eventCollection: "asset_log",
  target_property:"tag.rx_rssi",
  timeframe: "this_5_minute",
  filters:[
    {
        "property_name" : "tag.ibeacon.minor",
        "operator" : "eq",
        "property_value" : 1
    }

    ],
    groupBy: "sensor.location",
  //timeframe: "this_7_days"
});
var averageday = new Keen.Query("average", {
  eventCollection: "asset_log",
  target_property:"tag.rx_rssi",
  timeframe: "this_24_hours",
  filters:[
    {
        "property_name" : "tag.ibeacon.minor",
        "operator" : "eq",
        "property_value" : 1
    }

    ],
    groupBy: "sensor.location",
  //timeframe: "this_7_days"
});

var median = new Keen.Query("median", {
  eventCollection: "asset_log",
  target_property:"tag.rx_rssi",
  timeframe: "this_1_minute",
  filters:[
    {
        "property_name" : "tag.ibeacon.minor",
        "operator" : "eq",
        "property_value" : 1
    }

    ],
    groupBy: "sensor.location",
  //timeframe: "this_7_days"
});

var maximum = new Keen.Query("average", {
  eventCollection: "asset_log",
  target_property:"tag.rx_rssi",
  timeframe: "this_minute",
  filters:[
    {
        "property_name" : "tag.ibeacon.minor",
        "operator" : "eq",
        "property_value" : 1
    }
    /*{
        "property_name" : "keen.location.coordinates",
        "operator" : "within",
        "property_value" : {
            "coordinates":[45.393904, -72.761597],
            "max_distance_miles": 0.01,
        }
    }*/

    ],
    groupBy: "sensor.location",
  //timeframe: "this_7_days"
});

function electedLocation(response)
{

    var maxPower = -255;
    var electedLocation = null;
    for (index = 0; index < response.result.length; ++index) {
        if (response.result[index]['result'] > maxPower){
          maxPower = response.result[index]['result'];
          electedLocation = index;
        }
    }
    //var electedLocation =  Math.max.apply(Math, response.result);
    console.log("Elected Location:");
    console.log(response.result[electedLocation]);
};

// Send query
client.run(average1min, function(err, response){
  if (err) return console.log(err);
    console.log("************ Last Minute: TAG 1,1 ****************");
    console.log(response.result[0],response.result[1]);
    electedLocation(response);
});

// Send query
client.run(average5min, function(err, response){
  if (err) return console.log(err);
    console.log("************ Last 5 Minutes: TAG 1,1 ****************");
    console.log(response.result[0],response.result[1]);
    electedLocation(response);
});

// Send query
client.run(averageday, function(err, response){
  if (err) return console.log(err);
    console.log("************ Last 24 h: TAG 1,1 ****************");
    console.log(response.result[0],response.result[1]);
    electedLocation(response);
});



/*

// Send query
client.run(median, function(err, response){
  if (err) return console.log(err);
    console.log("************ Median TAG 1,1 ****************");
    console.log(response.result[0],response.result[1]);
});

// Send query
client.run(maximum, function(err, response){
  if (err) return console.log(err);
    console.log("************ Maximum TAG 1,1 ****************");
    console.log(response.result[0],response.result[1]);
});*/

