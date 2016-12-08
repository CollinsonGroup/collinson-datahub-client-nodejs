const eventService = require(__base + "lib/services/eventService");
const config = require("../config/config");
var eventServiceTest = function () {

	this.eventId = 0;

	var eventJson = {
		resourceVersion: "1",
		source: "offer.api",
		tenant: "1"
	};
	var options = {
		datahub: {
			host: config["host"],
			protocol: config["protocol"]
		}
	}

	function parseEventJson(json) {
		var message = JSON.parse(json);
		eventJson.messageType = message.messageType;
		eventJson.payload = message.payload;
	}

	this.When(/^I publish a payload: (.*)$/, { timeout: 30 * 1000 }, function (json, next) {
		parseEventJson(json);
		eventService().publish(eventJson, options).then(eventId => {
			this.eventId = eventId;
			next();
		});
	});

	this.When(/^I publish a payload using unexisting data hub host: (.*)$/, { timeout: 30 * 1000 }, function (json, next) {
		parseEventJson(json);
		options.datahub.host = 'invalid.host.local';
		options.retryInterval = [1];
		eventService().publish(eventJson, options).then(eventId => {
			this.eventId = eventId;
			next();
		});
	});

	this.Then(/^I get an eventId equal to 0$/, function (next) {
		if (parseInt(this.eventId) != 0)
			throw (new Error("EventId is " + this.eventId + " expected to be equal to 0"));
		next();
	});

	this.Then(/^I get an eventId greater than 0$/, function (next) {
		if (parseInt(this.eventId) == 0)
			throw (new Error("EventId is 0, expected to be greater than 0"));
		next();
	});
};

module.exports = eventServiceTest;
