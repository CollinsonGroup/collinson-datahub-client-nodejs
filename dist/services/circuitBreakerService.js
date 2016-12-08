
"use strict";

var CircuitBreaker = require('circuit-breaker-js');

var circuitBreakerService = function circuitBreakerService(settings) {
    var breaker = new CircuitBreaker(settings);

    function execute(command) {
        return new Promise(function (resolve, reject) {
            var commandHandler = function commandHandler(success, failed) {
                return command().then(function (response) {
                    success();
                    resolve(response);
                }, function (error) {
                    failed();
                    reject(error);
                });
            };
            breaker.run(commandHandler);
        });
    }

    function isOpen() {
        return breaker && breaker.isOpen();
    }

    return {
        execute: execute,
        isOpen: isOpen
    };
};

module.exports = circuitBreakerService;