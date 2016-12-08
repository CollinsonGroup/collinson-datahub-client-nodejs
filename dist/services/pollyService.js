
'use strict';

var pollyService = function pollyService() {

    var config = {
        count: 1,
        delays: [100],
        handleFn: function handleFn() {
            return true;
        },
        onRetryFn: function onRetryFn() {}
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
                });
            }

            execute();
        });
    }

    return {
        handle: function handle(handleFn) {
            if (typeof handleFn === 'function') {
                config.handleFn = handleFn;
            }
            return this;
        },

        waitAndRetry: function waitAndRetry(delays) {
            if (Array.isArray(delays)) {
                config.delays = delays;
            }
            return {
                onRetry: function onRetry(onRetryFn) {
                    if (typeof onRetryFn === 'function') {
                        config.onRetryFn = onRetryFn;
                    }

                    return this;
                },
                executeForPromise: executeForPromiseWithDelay.bind(null, config)
            };
        }
    };
};

module.exports = pollyService;