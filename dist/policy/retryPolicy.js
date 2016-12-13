
'use strict';

var failedEventService = require('../services/failedEventService');
var uuid = require('node-uuid');

var retryPolicy = function retryPolicy() {
    var retryCount = 0;
    var fileName = '';
    var config = {
        eventData: {},
        options: {}
    };

    function onRetry() {
        if (retryCount === 0) {
            fileName = uuid.v4();
            failedEventService.save(config.eventData, fileName, config.options.filePath);
        }
        retryCount++;
    }

    function onSuccess() {
        if (fileName) {
            failedEventService.delete(fileName, config.options.filePath);
        }
    }

    function handle() {
        return true;
    }

    return {
        get: function get(options) {
            config.eventData = options.httpRequest.data;
            if (options.failedEvent && options.failedEvent.filePath) {
                config.options.filePath = options.failedEvent.filePath;
            }

            var policy = {
                delays: options.retryInterval.slice(),
                handle: handle,
                onRetry: onRetry,
                onSuccess: onSuccess
            };
            return policy;
        }
    };
};

module.exports = retryPolicy;