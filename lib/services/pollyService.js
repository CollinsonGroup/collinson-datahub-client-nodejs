
'use strict';

var pollyService = function () {

    var config = {
        count: 1,
        delays: [100],
        handleFn: function () {
            return true;
        },
        onRetryFn: function () {
        }
    };


    function executeForPromiseWithDelay(config, cb) {

        return new Promise(function (resolve, reject) {
            function execute() {
                var original = cb();

                original.then(function (e) {
                    resolve(e);
                }, function (e) {
                    var delay = config.delays.shift();

                    config.onRetryFn();

                    if (delay && config.handleFn(e)) {
                        setTimeout(execute, delay);
                    } else {
                        reject(e);
                    }
                })
            }

            execute();
        });
    }

    return {
        handle: function (handleFn) {
            if (typeof handleFn === 'function') {
                config.handleFn = handleFn;
            }
            return this;
        },

        waitAndRetry: function (delays) {
            if (Array.isArray(delays)) {
                config.delays = delays;
            }
            return {
                onRetry: function (onRetryFn) {
                    if (typeof onRetryFn === 'function') {
                        config.onRetryFn = onRetryFn;
                    }

                    return this;
                },
                executeForPromise: executeForPromiseWithDelay.bind(null, config),
            };
        },
    };
};

module.exports = pollyService;