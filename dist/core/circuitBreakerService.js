
"use strict";

var CircuitBreaker = require('circuit-breaker-js');

var circuitBreakerService = function circuitBreakerService(policy) {
    var breaker = new CircuitBreaker(policy.settings);

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

            if (breaker.isOpen()) {
                return reject(new Error('Failed to publish message. Circuit breaker is open.'));
            }
            breaker.run(commandHandler);
        });
    }

    return {
        execute: execute
    };
};

module.exports = circuitBreakerService;