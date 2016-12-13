
'use strict';

var retryService = function retryService() {

    var config = {
        delays: [100],
        handle: function handle() {
            return true;
        },
        onRetry: function onRetry() {},
        onSuccess: function onSuccess() {}
    };

    function executeForPromiseWithDelay(config, cb) {

        return new Promise(function (resolve, reject) {
            function execute() {
                var original = cb();

                original.then(function (e) {
                    config.onSuccess();
                    resolve(e);
                }, function (e) {
                    var delay = config.delays.shift();

                    config.onRetry();

                    if (delay && config.handle(e)) {
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
        applyPolicy: function applyPolicy(policy) {
            config.delays = policy.delays || config.delays;
            if (typeof policy.handle === 'function') {
                config.handle = policy.handle;
            }
            if (typeof policy.onRetry === 'function') {
                config.onRetry = policy.onRetry;
            }
            if (typeof policy.onSuccess === 'function') {
                config.onSuccess = policy.onSuccess;
            }
            return {
                execute: executeForPromiseWithDelay.bind(null, config)
            };
        }
    };
};

module.exports = retryService;