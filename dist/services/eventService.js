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
        formatEvent(eventData);
        formatOptions(options);
        result.errors = validatorService.validate(eventData, options);
        return sendEvent(eventData, options).then(function (data) {
            result.data = data;
            return result;
        }, function (err) {
            result.errors.push(err);
            result.data = 0;
            return result;
        });
    }

    function formatEvent(eventData) {
        eventData.payload = JSON.stringify(eventData.payload);
        eventData.createdDateTime = new Date().toISOString();
    }

    function formatOptions(options) {
        options.retry = options.retry || config.retry;
        options.validation = options.validation || config.validation;
    }

    function sendEvent(eventData, options) {
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