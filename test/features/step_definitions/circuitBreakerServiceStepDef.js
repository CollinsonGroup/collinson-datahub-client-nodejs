var config = {
		circuitBreaker: {
			"windowDuration": 5000,
			"numBuckets": 5,
			"timeoutDuration": 3000,
			"errorThreshold": 50
		}
	}

var circuitBreakerService;

var circuitBreakerServiceTest = function () {

	var executeCount = 0;
	var totalAttempts = 0;

	function alwaysFailedcommand() {
		return new Promise(function (resolve, reject) {
			executeCount++;
			reject(new Error("Wrong value"));
		});
	}

	function executeWithCircuitBreaker() {
		return new Promise(function (resolve, reject) {
			function execute() {
				if (circuitBreakerService.isOpen()) {
					reject();
				}
				circuitBreakerService
					.execute(alwaysFailedcommand, config).then(() => resolve(), err => {
						if (totalAttempts > 0) {
							totalAttempts--;
							setTimeout(execute, 100);
						}
					});
			}
			execute();
		});
	}

	this.Given(/^I configure circuit breaker to open after (.*) attempt$/, function (attempt, next) {
		config.circuitBreaker.volumeThreshold = parseInt(attempt);
		circuitBreakerService = require(__base + "lib/services/circuitBreakerService")(config.circuitBreaker);
		next();
	});

	this.When(/^I execute an action that always fail for (.*) times$/, function (attempts, next) {
		totalAttempts = parseInt(attempts);
		executeWithCircuitBreaker().then(() => next(), () => next())
	});

	this.Then(/^Action is executed only (.*) times$/, function (times, next) {
		if (parseInt(executeCount) != parseInt(times))
			throw (new Error("Execute count is " + executeCount + " expected to be equal to " + times));
		next();
	});
};

module.exports = circuitBreakerServiceTest;