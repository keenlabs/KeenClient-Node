var keen = require('../index.js');

var keen = keen.configure({
	projectId: "54ac18d7672e6c659d9ec11c",
	writeKey: "89b6a8b5d4d06ef46bc6e6d0a6edb44e6b0b31cd7ee71e16b6732c9845b895e6a53f2777627aefcb57f31675fa53055f4a4300e67ce3f11030beb6cdb24f8da831f8b2de7a385cc5cfbebb625df9f9657409b02b98c75df3df064a6e86645d3e768b14743aa44d4378aebbd7a6af6f7e",
    readKey: "229d093c4469adbfb6b98f661c472091623f96036da7b3306d84d43507140e812733e359fbdb1d3a85dddf14a5a6096e2cff0010dfdfe1237f23832b7db5a26cb833af014cb24a7820f7e1d31045442c43b26fe6aef0a340ebcc3a3aa1a7911f0ed633b2e791011f164f67be0e81a03e",
    masterKey: "B21AAD07B57CAB093C32590D7DCEC901"
});
var collection = 'blufi_1';

// Get collection schema
//keen.collections.view(projectId, collection, function(err, res) {
//	console.log('collection.view', err, res);
//});

// Removes collection
// This is irreversible and will only work for collections under 10k events.
keen.collections.remove( collection, function(err, res) {
	console.log('collection.remove', err, res);
});
