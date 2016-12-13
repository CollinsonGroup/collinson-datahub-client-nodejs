"use strict";

var config = require('../config/config');
var validatorService = require('./validatorService');
var commandService = require('./commandService');
var httpService = require('../core/httpService');

var eventService = function eventService() {
    function publish(eventData, options) {
        formatEvent(eventData);
        validate(eventData, options);
        return sendEvent(eventData, options).then(function (eventId) {
            return eventId;
        }, function () {
            return 0;
        });
    }

    function formatEvent(eventData) {
        eventData.payload = JSON.stringify(eventData.payload);
        eventData.createdDateTime = new Date().toISOString();
    }

    function validate(eventJson, options) {
        config.validationPolicy = options.validationPolicy || config.validationPolicy;
        validatorService.validateEvent(eventJson, config.validationPolicy);
        validatorService.validateDataHubOptions(options.datahub);
    }

    function sendEvent(eventData, options) {
        options.retryInterval = options.retryInterval || config.retryInterval;
        options.httpRequest = {
            data: JSON.stringify(eventData),
            path: '/api/events',
            method: 'POST'
        };
        return commandService().executeCommand(httpService.post, options);
    }

    return {
        publish: publish
    };
};

module.exports = eventService;