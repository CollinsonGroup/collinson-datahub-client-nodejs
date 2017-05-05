"use strict";

var config = require('../config/config');
var validatorService = require('./validatorService');
var commandService = require('./commandService');
var httpService = require('../core/httpService');
var uuid = require('node-uuid');

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
            Metadata: {
                guid: uuid.v4(),
                version: eventData.resourceVersion,
                source: eventData.source,
                tenant: eventData.tenant,
                created_date_time: new Date().toISOString(),
                message_type: eventData.messageType
            },
            Payload: eventData.payload
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