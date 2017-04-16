var keen = require('../index.js');

var keen = keen.configure({
	projectId: "54ac18d7672e6c659d9ec11c",
	writeKey: "89b6a8b5d4d06ef46bc6e6d0a6edb44e6b0b31cd7ee71e16b6732c9845b895e6a53f2777627aefcb57f31675fa53055f4a4300e67ce3f11030beb6cdb24f8da831f8b2de7a385cc5cfbebb625df9f9657409b02b98c75df3df064a6e86645d3e768b14743aa44d4378aebbd7a6af6f7e"
});



// Construct same events
var events = {
	'asset_log': [		
	{ 
		sensor: {
			name:"blufi_1",
			version:"1.0",
			location:"CNC_1"
		},
		tag: {
			ibeacon: {
				uuid: "11111111-2222-3333-4444-555555555555",
				major: 1,
				minor: 1
			},
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -75,
			sdkversion: "android vercion 1"
		},
		keen: {
			"location": {
            "coordinates": [45.393904, -72.761597]
        	}
			//timestamp: new Date() // overwrite the recorded keen timestamp
		}
	},
	{ 
		sensor: {
			name:"blufi_2",
			version:"1.0",
			location:"CNC_2"
		},
		tag: {
			ibeacon: {
				uuid: "11111111-2222-3333-4444-555555555555",
				major: 1,
				minor: 1
			},
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -47,
			version: "2.1"
		},
		keen: {
			"location": {
            "coordinates": [45.393701, -72.761543]
        	}
			//timestamp: new Date() // overwrite the recorded keen timestamp
		}
	},
	{ 
		sensor: {
			name:"blufi_1",
			version:"1.0",
			location:"CNC_1"

		},
		tag: {
			ibeacon: {
				uuid: "11111111-2222-3333-4444-555555555555",
				major: 1,
				minor: 1
			},
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -87,
			sdkversion: "android vercion 1"
		},
		keen: {
			"location": {
            "coordinates": [45.393904, -72.761597]
        	}
			//timestamp: new Date() // overwrite the recorded keen timestamp
		}
	},
	{ 
		sensor: {
			name:"blufi_2",
			version:"1.0",
			location:"CNC_2"
		},
		tag: {
			ibeacon: {
				uuid: "11111111-2222-3333-4444-555555555555",
				major: 1,
				minor: 1
			},
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -60,
			version: "2.1"
		},
		keen: {
			"location": {
            "coordinates": [45.393701, -72.761543]
        	}
			//timestamp: new Date() // overwrite the recorded keen timestamp
		}
	},

]
};
// Send events to project
keen.addEvents(events
	, function(err, res) {
	console.log('events.insert', err, res);
});