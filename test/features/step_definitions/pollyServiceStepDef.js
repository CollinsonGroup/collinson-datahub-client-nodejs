const pollyService = require(__base + "lib/services/pollyService");

var pollyServiceTest = function () {

	var attemptsCount = 0;
	var totalAttempts = 0;

	function alwaysFailedcommand() {
		return new Promise(function (resolve, reject) {
			attemptsCount++;
			reject(new Error("Wrong value"));
		});
	}

	function succeedOnLastRetryCommand() {
		return new Promise(function (resolve, reject) {
			if (attemptsCount == (totalAttempts)) {
				resolve();
			}
			else {
				attemptsCount++;
				reject(new Error("Wrong value"));
			}
		});
	}

	this.When(/^I try to execute an action that always fail, in interval: (.*)$/, function (json, next) {
		attemptsCount = 0;
		var jsonObj = JSON.parse(json);
		pollyService()
			.waitAndRetry(jsonObj.retryInterval)
			.executeForPromise(alwaysFailedcommand).then(() => next(), err => next());
	});

	this.When(/^I try to execute an action that succeed on last retry, in interval: (.*)$/, function (json, next) {
		var jsonObj = JSON.parse(json);
		attemptsCount = 0;
		totalAttempts = jsonObj.retryInterval.length;
		pollyService()
			.waitAndRetry(jsonObj.retryInterval)
			.executeForPromise(succeedOnLastRetryCommand).then(() => next(), err => next());
	});

	this.Then(/^Total number of attempts is (.*)$/, function (attempts, next) {
		if (parseInt(attemptsCount) != parseInt(attempts))
			throw (new Error("Retry count is " + attemptsCount + " expected to be equal to " + attempts));
		next();
	});
};

module.exports = pollyServiceTest;