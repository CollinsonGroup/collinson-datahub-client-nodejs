"use strict";

var circuitPolicy = require('../policy/circuitPolicy');
var retryPolicy = require('../policy/retryPolicy');
var circuitBreakerService = require('../core/circuitBreakerService')(circuitPolicy);
var retryService = require('../core/retryService');

var commandService = function commandService() {

    function executeCommand(action, options) {
        var command = getCommand(action, options);
        command = decorateWithCircuitBreaker(command);
        command = decorateWithRetry(options, command);
        return command();
    }

    function getCommand(action, options) {
        var commandOptions = getCommandOptions(options);
        return function () {
            return action(commandOptions);
        };
    }

    function decorateWithCircuitBreaker(command) {
        return function () {
            return circuitBreakerService.execute(command);
        };
    }

    function decorateWithRetry(options, command) {
        var policy = retryPolicy().get(options);
        return function () {
            return retryService().applyPolicy(policy).execute(command);
        };
    }

    function getCommandOptions(options) {
        return {
            protocol: options.datahub.protocol + ':',
            host: options.datahub.host,
            json: options.httpRequest.data,
            path: options.httpRequest.path,
            method: options.httpRequest.method,
            headers: {
                "Content-Type": "application/json",
                'Content-Length': Buffer.byteLength(options.httpRequest.data)
            }
        };
    }

    return {
        executeCommand: executeCommand
    };
};

module.exports = commandService;