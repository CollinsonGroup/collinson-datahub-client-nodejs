"use strict";

var validatorService = {

    validate: function validate(eventData, options) {
        this.validateDataHub(options.datahub);
        this.validateRetryOptions(options.retry);
        this.validateCircuitBreakerOptions(options.circuitBreaker);
        return this.validateEvent(eventData, options.validation);
    },

    validateEvent: function validateEvent(event, validation) {
        var errors = [];
        if (!event.Metadata) {
            errors.push('Metadata is required!');
        } else {
            if (!event.Metadata.version) {
                errors.push('Resource Version is required!');
            }
            if (!event.Metadata.source) {
                errors.push('Source is required!');
            }
            if (!event.Metadata.tenant) {
                errors.push('Tenant is required!');
            }
            if (!event.Metadata.message_type) {
                errors.push('MessageType is required!');
            }
        }
        this.validatePayload(event.Payload, errors);
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

    validateCircuitBreakerOptions: function validateCircuitBreakerOptions(circuitBreaker) {
        var errors = [];
        if (this.isNotANumber(circuitBreaker.windowDuration)) {
            errors.push('Circuit Breaker windowDuration is not a valid number');
        }
        if (this.isNotANumber(circuitBreaker.numBuckets)) {
            errors.push('Circuit Breaker numBuckets is not a valid number');
        }
        if (this.isNotANumber(circuitBreaker.timeoutDuration)) {
            errors.push('Circuit Breaker timeoutDuration is not a valid number');
        }
        if (this.isNotANumber(circuitBreaker.errorThreshold)) {
            errors.push('Circuit Breaker errorThreshold is not a valid number');
        }
        if (this.isNotANumber(circuitBreaker.volumeThreshold)) {
            errors.push('Circuit Breaker volumeThreshold is not a valid number');
        }
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    },

    validatePayload: function validatePayload(payload, errors) {
        // Note: deliberate type coercion for undefined == null
        if (payload == null || payload === "") {
            errors.push('Payload is not a valid object!');
        }
    },

    isNotANumber: function isNotANumber(number) {
        return !number || isNaN(number);
    }
};

module.exports = validatorService;