/* jshint quotmark:false,indent:4,maxlen:600 */
var should = require("should");

describe("keen", function() {

    var keen;
    var projectId = "fakeProjectId";
    var writeKey = "fakeWriteKey";
    var nock = require("nock");

    beforeEach(function() {
        nock.cleanAll();
        keen = require("../");
        keen = keen.configure({
            projectId: projectId,
            writeKey: writeKey
        });
    });

    it("configure should set up client correctly", function() {
        keen = require("../");
        var projectId = "projectId";
        var writeKey = "writeKey";
        var readKey = "readKey";
        var masterKey = "masterKey";
        keen = keen.configure({
            projectId: projectId,
            writeKey: writeKey,
            readKey: readKey,
            masterKey: masterKey
        });

        should.exist(keen);
        keen.projectId.should.equal(projectId);
        keen.writeKey.should.equal(writeKey);
        keen.readKey.should.equal(readKey);
        keen.masterKey.should.equal(masterKey);
        keen.baseUrl.should.equal("https://api.keen.io/");
        keen.apiVersion.should.equal("3.0");

        keen._flushOptions.should.eql({
            atEventQuantity: 20,
            afterTime: 10000, 
            maxQueueSize: 10000,
            timerInterval: 10000
        });

        keen._queue.should.eql([]);
        keen._lastFlush.should.be.instanceOf(Date);
    });

    it("configure should allow overriding baseUrl and apiVersion", function() {
        keen = require("../");
        var projectId = "projectId";
        var baseUrl = "blah";
        var apiVersion = "foo";
        keen = keen.configure({
            projectId: projectId,
            baseUrl: baseUrl,
            apiVersion: apiVersion
        });

        should.exist(keen);
        keen.projectId.should.equal(projectId);
        keen.baseUrl.should.equal(baseUrl);
        keen.apiVersion.should.equal(apiVersion);
    });

    it("configure should error on bad input", function() {
        keen = require("../");

        var badInputHelper = function(config, expectedErrorMessage) {
            try {
                keen.configure();
                should.fail();
            } catch (error) {
                should.exist(error);
                if (expectedErrorMessage) {
                    error.message.should.equal(expectedErrorMessage);
                }
            }
        };

        badInputHelper(undefined, "The 'config' parameter must be specified and must be a JS object.");
        badInputHelper(null, "The 'config' parameter must be specified and must be a JS object.");
        badInputHelper({}, "The 'config' parameter must be specified and must be a JS object.");
    });

    it("addEvent should require a writeKey", function(done) {
        keen = require("../");

        keen = keen.configure({
            projectId: projectId
        });

        keen.addEvent("eventCollection", {}, function(error) {
            should.exist(error);
            error.message.should.equal("You must specify a non-null, non-empty 'writeKey' in your 'config' object when calling keen.configure()!");
            done();
        });
    });

    var mockPostRequest = function(path, responseCode, responseBody) {
        nock("https://api.keen.io")
        .post(path)
        .reply(responseCode, responseBody, {"Content-Type": "application/json"});
    };

    var mockGetRequest = function(path, responseCode, responseBody) {
        nock("https://api.keen.io")
        .get(path)
        .reply(responseCode, responseBody, {"Content-Type": "application/json"});
    };

    it("addEvent should make correct HTTP request", function(done) {
        var eventCollection = "purchases";

        mockPostRequest("/3.0/projects/" + projectId + "/events/" + eventCollection, 201, {success: true});

        keen.addEvent(eventCollection, {"a": "b"}, function(error, responseBody) {
            should.not.exist(error);
            JSON.stringify(responseBody).should.equal(JSON.stringify({success: true}));
            done();
        });
    });

    it("addEvents should make correct HTTP request", function(done) {
        mockPostRequest("/3.0/projects/" + projectId + "/events", 200, {
            "collection1": [{success: true}]
        });

        keen.addEvents({
            "collection1": [{"a": "b"}]
        }, function(error, responseBody) {
            should.not.exist(error);
            JSON.stringify(responseBody).should.equal(JSON.stringify({"collection1": [{success: true}]}));
            done();
        });
    });

    it("encrypt should generate a usable scoped key", function() {
        keen = require("../");
        var apiKey = "80ce00d60d6443118017340c42d1cfaf";
        var options = {
            "allowed_operations": ["read"],
            "filters": [ {
                "property_name": "purchase.amount",
                "operator": "eq",
                "property_value": 56
            }, {
                "property_name": "purchase.name",
                "operator": "ne",
                "property_value": "Barbie"
            }]
        };
        var scopedKey = keen.encryptScopedKey(apiKey, options);

        // decrypt
        var decryptedOptions = keen.decryptScopedKey(apiKey, scopedKey);
        decryptedOptions.should.eql(options);
    });

    it("decrypt should return the correct options", function() {
        keen = require("../");
        var apiKey = "f5d7c745ba4f437a82db02ca8b416556";
        var scopedKey = "7b8f357fa55e35efb2f7fa51a03ec2835c5537e57457c5a7c1c40c454fc00d5addef7ed911303fc2fa9648d3ae13e638192b86e90cd88657c9dc5cf03990cbf6eb2a7994513d34789bd25447f3dccaf5a3de3b9cacf6c11ded581e0506fca147ea32c13169787bbf8b4d3b8f2952bc0bea1beae3cfbbeaa1f421be2eac4cc223";
        var options = keen.decryptScopedKey(apiKey, scopedKey);
        var expected = {
            filters:[ { property_name: 'account_id',
            operator: 'eq',
            property_value: '4d9a4c421d011c553e000001' } ]
        };
        expected.should.eql(options);
    });

    it("should handle API errors", function(done) {
        var id = 'foo';
        var mockResponse = {error_code: 'FooError', message: 'no foo'};
        mockPostRequest("/3.0/projects/"+projectId+"/events/"+id, 500, mockResponse);

        keen.addEvent(id, {}, function(err) {
            err.should.be.an.instanceOf(Error);
            err.should.have.property('message', mockResponse.message);
            err.should.have.property('code', mockResponse.error_code);
            done();
        });
    });

    describe('request', function() {
        it("should expect a GET/POST/DEL method", function() {
            should(function() {
                keen.request('foo', 'write', '/');
            }).throwError('Method must be of type: GET/POST/DEL');
        });

        it("should expect a write/read/master keytype", function() {
            should(function() {
                keen.request('get', 'foo', '/');
            }).throwError('Key must be of type: master/write/read');
        });

        it("should require a string path", function() {
            should(function() {
                keen.request('get', 'read');
            }).throwError('\'path\' must be a string.');
        });

        it("should expect a key to be set", function() {
            should(function() {
                keen.request('get', 'read', '/');
            }).throwError('You must specify a nun-null, non-empty \'readKey\' in your config object.');
        });

        describe('send the request', function() {
            var projectId = "projectId";
            var baseUrl = "https://api.keen.io/";
            var apiVersion = "3.0";
            var mockResponse = {result: 1};
            var keen = require('../').configure({
                projectId: projectId,
                baseUrl: baseUrl,
                apiVersion: apiVersion,
                readKey: 'foo'
            });

            it('should send the request', function() {
                mockGetRequest("/3.0/projects/"+projectId+"/queries/count?event_collection=foo", 200, mockResponse);
                keen.request('get', 'read', '/queries/count', {event_collection:'foo'}, function(err, res) {
                    (err === null).should.be.true;
                    res.should.eql(mockResponse);
                });
            });

            it('has optional params', function() {
                mockGetRequest("/3.0/projects/"+projectId+"/queries/count?event_collection=bar", 200, mockResponse);
                keen.request('get', 'read', '/queries/count?event_collection=bar', function(err, res) {
                    (err === null).should.be.true;
                    res.should.eql(mockResponse);
                });
            });
        });
    });

    describe('flushing', function () {

        // First things first:
        // * [x] A small refactor to handle promises/callbacks better.
        //       We need to get the promise.
        //       It can be returned.
        //       But we shall also try to store the response logic against it.
        //       We continue to pass in callbacks as before, in order to stay compatible.
        // * [ ] Need serious rewrite. Reuse of request object is making queueing horrendous.

        describe('triggers', function () {

            var triggers = require('../lib/triggers');

            describe('#isQueueBeyondLimit()', function () {

                it('should be able to return true', function () {
                    var clientScope = {
                        _queue: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                        _flushOptions: {
                            atEventQuantity: 10
                        }
                    };

                    triggers.isQueueBeyondLimit.apply(clientScope).should.be.true;
                });

                it('should be able to return false', function () {
                    var clientScope = {
                        _queue: [1, 2, 3],
                        _flushOptions: {
                            atEventQuantity: 10
                        }
                    };

                    triggers.isQueueBeyondLimit.apply(clientScope).should.be.false;
                });

            });

            describe('#hasTimePassedSinceLastFlush()', function () {
                
                it('should be able to return true', function () {
                    var lastFlushTime = new Date();
                    lastFlushTime = lastFlushTime.setDate(lastFlushTime.getDate() - 7);

                    var clientScope = {
                        _lastFlush: lastFlushTime,
                        _flushOptions: {
                            afterTime: 10000
                        }
                    };

                    triggers.hasTimePassedSinceLastFlush.apply(clientScope).should.be.true;
                });

                it('should be able to return false', function () {
                    var lastFlushTime = new Date();
                    var clientScope = {
                        _lastFlush: lastFlushTime,
                        _flushOptions: {
                            afterTime: 10000
                        }
                    };

                    triggers.hasTimePassedSinceLastFlush.apply(clientScope).should.be.false;
                });

            });

        });

        // By default the library will flush:
        // * [ ] Every N messages.
        // * [ ] If S milliseconds has passed since the last flush.

        // Notes:
        // * [x] Before flushing a message contains a promise.
        // * [x] Configurable.
        // * [ ] If there are too many messages and the module cannot flush faster than it's 
        //   receiving messages, it will stop accepting messages instead of growing the queue
        //   until it runs out of memory... :)
        // * [ ] We should be able to flush manually.

        // Code:
        // * [x] Check things are constructed correctly.
        // * [x] Create small triggers.
        // * [ ] Implement _enqueue().
        // * [ ] Implement _checkFlush().
        // * [ ] Implement flush().
        // * [ ] Implement _setTimer and _clearTimer().

        describe('_enqueue()', function () {
            // Drop data if the queue has expanded beyond the max queue size.
            // Log an error message.

            // Push to the queue.

            // Check to see whether the timer was set.

            // Check whether it should be flushing.
        });

        describe('_checkFlush()', function () {
            // @todo: To begin with just flush immediately.

            // then:

            // Loop through the triggers, whichs should be set against the client.
            // *OR* with a variable `shouldFlush`, on triggering against the scope.

            // Call flush if true, and false otherwise.

            // Return true or false.
        });

        describe('flush()', function () {
            // Given an empty queue, do nothing.

            // If the queue length is non-zero, then...
            // create a batch by splicing up until `this.options.flushAt`
            // also, test that this reduces the size of the queue.

            // Get a list of promises.

            // Make each of the requests in the batch.

            // Set `this._lastFlush` to the current date.

            // If the queue length gets to zero, then clear the timer.
        });

        describe('_setTimer', function () {
            // @todo: Do nothing for now but implement.

            // If there is no timer, then create a timer with an interval.
        });

        describe('_clearTimer', function () {
            // @todo: Do nothing for now but implement.

            // Clear the timer if there is a timer.
        });
    });
});
