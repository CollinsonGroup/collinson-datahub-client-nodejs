"use strict";

var config = require('../config/config');
var validatorService = require('./validatorService');
var commandService = require('./commandService');
var httpService = require('../core/httpService');

var eventService = function eventService() {
    var result = {
        errors: [],
        data: null
    };

    function publish(eventData, options) {
        eventData = getFormattedEvent(eventData);
        formatOptions(options);
        result.errors = validatorService.validate(eventData, options);
        return sendEvent(eventData, options).then(function (data) {
            result.data = data;
            return result;
        }, function (err) {
            result.errors.push(err.message);
            result.data = 0;
            return result;
        });
    }

    function getFormattedEvent(eventData) {
        return {
            metadata: {
                resourceVersion: eventData.resourceVersion,
                source: eventData.source,
                tenant: eventData.tenant,
                createdDateTime: new Date().toISOString(),
                messageType: eventData.messageType
            },
            payload: eventData.payload
        };
    }

    function formatOptions(options) {
        options.retry = options.retry || config.retry;
        options.validation = options.validation || config.validation;
        options.circuitBreaker = options.circuitBreaker || config.circuitBreaker;
    }

    function sendEvent(eventData, options) {
        options.httpRequest = {
            data: JSON.stringify(eventData),
            path: '/api/events',
            method: 'POST'
        };
        return commandService(options).executeCommand(httpService.post);
    }

    return {
        publish: publish
    };
};

module.exports = eventService;