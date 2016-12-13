"use strict";

var eventService = require('./services/eventService');
module.exports = eventService;

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
};