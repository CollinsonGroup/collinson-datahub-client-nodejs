"use strict";

var validatorService = {

    validate: function validate(eventData, options) {
        this.validateDataHub(options.datahub);
        this.validateRetryOptions(options.retry);
        return this.validateEvent(eventData, options.validation);
    },

    validateEvent: function validateEvent(event, validation) {
        var errors = [];
        if (!event.resourceVersion) {
            errors.push('Resource Version is required!');
        }
        if (!event.source) {
            errors.push('Source is required!');
        }
        if (!event.tenant) {
            errors.push('Tenant is required!');
        }
        if (!event.messageType) {
            errors.push('MessageType is required!');
        }
        this.validatePayload(event.payload, errors);
        if (errors.length > 0 && validation.strictMode) {
            throw new Error(errors.join('\n'));
        }
        return errors;
    },

    validateDataHub: function validateDataHub(datahub) {
        var errors = [];
        if (!datahub.protocol) {
            errors.push('Http protocol is missing!');
        }
        if (!datahub.host) {
            errors.push('Data hub host is missing!');
        }
        if (datahub.protocol !== 'http' && datahub.protocol !== 'https') {
            errors.push('Protocol possible value are : http or https!');
        }
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    },

    validateRetryOptions: function validateRetryOptions(retry) {
        if (!Array.isArray(retry.interval)) {
            throw new Error('Retry interval is not a valid array');
        }
    },

    validatePayload: function validatePayload(payload, errors) {
        if (!payload || payload.startsWith("{") && payload.endsWith("}") || payload.startsWith("[") && payload.endsWith("]")) {
            try {
                JSON.parse(payload);
            } catch (err) {
                errors.push('Payload is not a valid json object!');
            }
        } else {
            errors.push('Payload is not a valid json object!');
        }
    }
};

module.exports = validatorService;