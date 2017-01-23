"use strict";

var retryPolicy = require('../policy/retryPolicy');
var retryService = require('../core/retryService');
var circuitBreakerService = void 0;

var commandService = function commandService(options) {
    var commandOptions = options;
    if (!circuitBreakerService) {
        circuitBreakerService = require('../core/circuitBreakerService')(commandOptions.circuitBreaker);
    }
    function executeCommand(action) {
        var command = getCommand(action);
        command = decorateWithCircuitBreaker(command);
        command = decorateWithRetry(options, command);
        return command();
    }

    function getCommand(action) {
        var actionOptions = getActionOptions();
        return function () {
            return action(actionOptions);
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

    function getActionOptions() {
        var headers = {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(commandOptions.httpRequest.data)
        };

        if (commandOptions.datahub.apiKey) {
            headers["Authorization"] = "Basic " + commandOptions.datahub.apiKey;
        }

        return {
            uri: commandOptions.datahub.protocol + '://' + commandOptions.datahub.host + commandOptions.httpRequest.path,
            body: commandOptions.httpRequest.data,
            method: commandOptions.httpRequest.method,
            headers: headers
        };
    }

    return {
        executeCommand: executeCommand
    };
};

module.exports = commandService;