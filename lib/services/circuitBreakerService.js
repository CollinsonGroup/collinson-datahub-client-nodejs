
"use strict";
const CircuitBreaker = require('circuit-breaker-js');


var circuitBreakerService = function (settings) {
    var breaker = new CircuitBreaker(settings);

    function execute(command) {
        return new Promise((resolve, reject) => {
            let commandHandler = (success, failed) => command().then(response => {
                success();
                resolve(response);
            }, error => {
                failed();
                reject(error);
            });
            breaker.run(commandHandler)
        });
    }

    function isOpen()
    {
        return breaker && breaker.isOpen();
    }

    return {
        execute: execute,
        isOpen:isOpen
    }

}

module.exports = circuitBreakerService;
