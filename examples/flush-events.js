var keen = require('../index.js'),
    keenClient = keen.configure({
        projectId: "<project-key>",
        writeKey: "<write-key>",
        /*flush: {
            atEventQuantity: 1,
            afterTime: 500    
        }*/
    });

// Construct same events
var event = {
    data: {
        name: 'Fred',
        age: 30
    },
    keen: {
        timestamp: new Date(0) // overwrite the recorded keen timestamp
    }
};

var otherEvent = {
    data: {
        name: 'John',
        age: 40
    }
};

var finalEvent = {
    data: {
        name: 'John Smith',
        age: 20
    }
};

var respond = function (err, res) {
    console.log('event.insert', err, res);
};

// Send events to project
keenClient.addEvent('flush-test', event, respond);
keenClient.addEvent('flush-test', otherEvent, respond);
keenClient.addEvent('flush-test', finalEvent, respond);