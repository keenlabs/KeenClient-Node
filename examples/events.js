var keen = require('../index.js');

var keen = keen.configure({
	projectId: "54ac18d7672e6c659d9ec11c",
	writeKey: "89b6a8b5d4d06ef46bc6e6d0a6edb44e6b0b31cd7ee71e16b6732c9845b895e6a53f2777627aefcb57f31675fa53055f4a4300e67ce3f11030beb6cdb24f8da831f8b2de7a385cc5cfbebb625df9f9657409b02b98c75df3df064a6e86645d3e768b14743aa44d4378aebbd7a6af6f7e"
});



// Construct same events
var events = {
	'log_tag_1_1': [		
	{ 
		sensor: {
			name:"blufi_1",
			version:"1.0",
			location:"CNC_1"
		},
		tag: {
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -80,
			sdkversion: "android vercion 1"
		},
		keen: {
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
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -54,
			version: "2.1"
		},
		keen: {
			//timestamp: new Date() // overwrite the recorded keen timestamp
		}
	},

],
'log_tag_1_2': [		
	{ 
		sensor: {
			name:"blufi_1",
			version:"1.0",
			location:"CNC_1"

		},
		tag: {
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -54,
			sdkversion: "android vercion 1"
		},
		keen: {
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
			tx_power: -4,
			provider:"stickNfind",
			rx_rssi: -60,
			version: "2.1"
		},
		keen: {
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