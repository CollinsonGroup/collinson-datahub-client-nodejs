"use strict";

var config = require('../config/config');
var circuitBreakerService = require('./circuitBreakerService')(config.circuitBreaker);
var validatorService = require('./validatorService');
var dataService = require('./dataService');
var httpService = require('./httpService');
var pollyService = require('./pollyService');

var eventService = function eventService() {
    var retryCount = 0;
    var eventJsonString = '';

    function publish(eventJson, options) {
        init(eventJson);
        validate(eventJson, options);
        return sendEvent(options);
    }

    function init(eventJson) {
        eventJson.payload = JSON.stringify(eventJson.payload);
        eventJson.createdDateTime = new Date().toISOString();
        eventJsonString = JSON.stringify(eventJson);
    }

    function validate(eventJson, options) {
        config.validationPolicy = options.validationPolicy || config.validationPolicy;
        validatorService.validateEvent(eventJson, config.validationPolicy);
        validatorService.validateDataHubOptions(options.datahub);
    }

    function sendEvent(options) {
        config.retryInterval = options.retryInterval || config.retryInterval;

        var commandOptions = getCommandOptions(options.datahub);
        var command = function command() {
            return httpService.post(commandOptions);
        };
        var circuitBreakerCommand = function circuitBreakerCommand() {
            return circuitBreakerService.execute(command, config);
        };

        if (circuitBreakerService.isOpen()) {
            dataService.save(eventJsonString);
        }

        return pollyService().waitAndRetry(config.retryInterval.slice()).onRetry(onRetryFn).executeForPromise(circuitBreakerCommand).then(function (eventId) {
            return eventId;
        }, function () {
            return 0;
        });
    }

    function onRetryFn() {
        if (retryCount === 0) {
            dataService.save(eventJsonString);
        }
        retryCount++;
    }

    function getCommandOptions(datahub) {
        return {
            protocol: datahub.protocol + ':',
            host: datahub.host,
            json: eventJsonString,
            path: '/api/events',
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'Content-Length': Buffer.byteLength(eventJsonString)
            }
        };
    }

    return {
        publish: publish
    };
};

module.exports = eventService;