"use strict";

var config = {
    circuitBreaker: {
        windowDuration: 5000,
        numBuckets: 5,
        timeoutDuration: 10000,
        errorThreshold: 50,
        volumeThreshold: 5
    },
    retry: {
        interval: [1000, 2000, 4000]
    },
    validation: {
        strictMode: true
    }
};
module.exports = config;