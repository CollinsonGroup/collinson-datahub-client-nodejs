"use strict";

const config = require('../config/config');
const circuitBreakerService = require('./circuitBreakerService')(config.circuitBreaker);
const validatorService = require('./validatorService');
const dataService = require('./dataService');
const httpService = require('./httpService');
const pollyService = require('./pollyService')

var eventService = function () {
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
        config.validationPolicy = options.validationPolicy || config.validationPolicy
        validatorService.validateEvent(eventJson, config.validationPolicy);
        validatorService.validateDataHubOptions(options.datahub);
    }

    function sendEvent(options) {
        config.retryInterval = options.retryInterval || config.retryInterval;

        let commandOptions = getCommandOptions(options.datahub);
        let command = () => httpService.post(commandOptions);
        let circuitBreakerCommand = () => circuitBreakerService.execute(command, config);

        if (circuitBreakerService.isOpen()) {
            dataService.save(eventJsonString);
        }

        return pollyService()
            .waitAndRetry(config.retryInterval.slice())
            .onRetry(onRetryFn)
            .executeForPromise(circuitBreakerCommand).then(eventId => eventId, () => 0);
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
            },
        };
    }

    return {
        publish: publish
    }
};

module.exports = eventService;