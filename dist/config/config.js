"use strict";

var config = {
    circuitBreaker: {
        "windowDuration": 5000,
        "numBuckets": 5,
        "timeoutDuration": 3000,
        "errorThreshold": 50,
        "volumeThreshold": 5
    },
    retryInterval: [1000, 2000],
    validationPolicy: 'STRICT'
};
module.exports = config;