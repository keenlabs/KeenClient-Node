var rest = require('superagent');
var crypto = require('crypto');
var qs = require('querystring');

// Handle logic of processing response, including error messages
// The error handling should be strengthened over time to be more 
// meaningful and robust
// ---------------------------------------------------------------

function processResponse(err, res, callback) {
  callback = callback || function() {};

  if (res && !res.ok && !err) {
    var is_err = res.body && res.body.error_code;
    err = new Error(is_err ? res.body.message : 'Unknown error occurred');
    err.code = is_err ? res.body.error_code : 'UnknownError';
  }

  if (err) return callback(err);
  return callback(null, res.body);
}

module.exports = {
  get: function(apiKey, path, data, callback) {
    rest
    .get(this.baseUrl + this.apiVersion + path)
    .set('Authorization', apiKey)
    .query(data || {})
    .end(function(err, res) {
      processResponse(err, res, callback);
    });
  },
  post: function(apiKey, path, data, callback) {
    rest
    .post(baseUrl + apiVersion + path)
    .set('Authorization', apiKey)
    .set('Content-Type', 'application/json')
    .send(data || {})
    .end(function(err, res) {
      processResponse(err, res, callback);
    });
  },
  del: function(apiKey, path, callback) {
    rest
    .del(baseUrl + apiVersion + path)
    .set('Authorization', apiKey)
    .set('Content-Length', 0)
    .end(function(err, res) {
      processResponse(err, res, callback);
    });
  }
};
