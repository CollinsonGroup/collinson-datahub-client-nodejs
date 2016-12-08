"use strict";
const constants = require('./constants')

const validatorService = {

    validateEvent: function (event, policy) {
        if (policy !== constants.validationPolicy.strict) {
            return;
        }
        if (!event.resourceVersion) {
            throw new Error('Resource Version is required!');
        }
        if (!event.source) {
            throw new Error('Source is required!');
        }
        if (!event.tenant) {
            throw new Error('Tenant is required!');
        }
        if (!event.messageType) {
            throw new Error('MessageType is required!');
        }
        this.validatePayload(event.payload)
    },

    validateDataHubOptions: function (options) {
        if (!options.protocol) {
            throw new Error('Http protocol is missing!');
        }
        if (!options.host) {
            throw new Error('Data hub host is missing!');
        }
        if (options.protocol !== 'http' && options.protocol !== 'https') {
            throw new Error('Protocol possible value are : http or https!');
        }
    },

    validatePayload: function (jsonString) {
        if ((jsonString.startsWith("{") && jsonString.endsWith("}")) ||
            (jsonString.startsWith("[") && jsonString.endsWith("]"))) {
            try {
                JSON.parse(jsonString);
                return;
            } catch (err) {
                throw new Error('Payload is not a valid json object!');
            }
        }
        throw new Error('Payload is not a valid json object!');
    }
};

module.exports = validatorService;