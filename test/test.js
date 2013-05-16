var should = require("should")

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

        keen.addEvent("eventCollection", {}, function(error, responseBody) {
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
});