var _ = require('underscore');
var KeenRequests = require('./requests');

/*! 
* -----------------
* Keen IO Query JS
* -----------------
*/

var Keen = {};

// ------------------------------
// Keen.Query
// ------------------------------

Keen.Query = function(){
  this.data = {};
  this.configure.apply(this, arguments);
}

Keen.Query.prototype.configure = function(client, analyses, callback){
  this.client = client;
  this.analyses = analyses;
  this.callback = callback;
  this.refresh();
  return this;
};

Keen.Query.prototype.refresh = function(){
  var self = this, 
      completions = 0, 
      response = [];
  
  var handleResponse = function(err, res){
    if (err && self.callback) {
      return self.callback(err, null);
    }
    response[arguments[2]] = res, completions++;
    if (completions == self.analyses.length) {
      self.data = (self.analyses.length == 1) ? response[0] : response;
      if (self.callback) self.callback(null, self.data);
    }
  };
  
  _.each(self.analyses, function(analysis, index){
    var data, path = '/projects/' + self.client.projectId;
    var callbackSequencer = function(err, res){
      handleResponse(err, res, index);
    };
    
    if (analysis instanceof Keen.Analysis) {
      path += analysis.path + '?event_collection=' + analysis.event_collection;
      data = analysis.params || {};
      
    } 
    /* TODO: Test and deploy this
    else if (_.isString(analysis)) {
      path += '/saved_queries/' + analysis + '/result';
      data = { api_key: self.client.readKey };
      
    }*/ 
    else {
      throw new Error('Analysis #' + (index+1)  +' is not valid');
      
    }
    
    KeenRequests.get.call(self.client, self.client.readKey, path, data, callbackSequencer);
  });
  
  return self;
};

// Export <client>.query method
// ------------------------------
module.exports.client = {
  query: function(input, callback){
    if (!input) throw new Error('Queries require at least one analysis');
    var analyses = (_.isArray(input)) ? input : [input];
    return new Keen.Query(this, analyses, callback);
  }
};


// ------------------------------
// Keen.Analysis
// ------------------------------

Keen.Analysis = function(){
  this.data = {};
}

Keen.Analysis.prototype.configure = function(resource, collection, params){
  if (!collection) throw new Error('Event Collection name is required');
  this.path = '/queries/' + resource;
  this.event_collection = collection;
  this.params = params || {};
  return this;
};

Keen.Analysis.prototype.get = function(attribute) {
  return this.params[attribute] || null;
};

Keen.Analysis.prototype.set = function(attributes) {
  for (var attribute in attributes) {
    this.params[attribute] = attributes[attribute];
  }
  return this;
};

// Analysis Types
// ------------------------------
var analysisTypes = [
  'Count', 
  'Count_Unique', 
  'Sum', 
  'Average', 
  'Minimum', 
  'Maximum', 
  'Select_Unique', 
  'Extraction',
  'Funnel'
];

// Build and export methods
// ------------------------------
module.exports.analyses = {};

_.each(analysisTypes, function(type){
  Keen.Analysis[type] = function(){
    var args = Array.prototype.slice.call(arguments);
    this.configure.apply(this, [type.toLowerCase()].concat(args));
  };
  Keen.Analysis[type].prototype = new Keen.Analysis();
  module.exports.analyses[type.replace("_","")] = Keen.Analysis[type];
});

// Funnels are special
// ------------------------------
Keen.Analysis.Funnel.prototype.configure = function(resource, collection, params) {
  if (!params.steps) throw new Error('Funnel steps are required');
  this.path = '/queries/' + resource;
  this.event_collection = collection;
  this.params = params || {};
  // TODO: set up steps
  return this;
}
