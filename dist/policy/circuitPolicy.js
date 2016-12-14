
'use strict';

var config = require('../config/config');

var circuitPolicy = {
    settings: config.circuitBreaker
};
module.exports = circuitPolicy;