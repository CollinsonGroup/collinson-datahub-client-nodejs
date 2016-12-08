const validatorService = require(__base + "lib/services/validatorService");
var validatorServiceTest = function () {

	this.errorMsg = '';

	this.When(/^I send json: (.*)$/, function (json, next) {
		try {
			validatorService.validateEvent(JSON.parse(json));
		} catch (err) {
			this.errorMsg = err.message;	
		}

		next();
	});

	this.When(/^I send data hub options: (.*)$/, function (json, next) {
		try {
			validatorService.validateDataHubOptions(JSON.parse(json));
		} catch (err) {
			this.errorMsg = err.message;	
		}

		next();
	});

	this.When(/^I send json with invalid payload: (.*)$/, function (json, next) {
		var jsonObject = JSON.parse(json);
		jsonObject.payload = '{"amount" "count": "4"}';
		try {
			validatorService.validateEvent(jsonObject);
		} catch (err) {
			this.errorMsg = err.message;	
		}

		next();
	});

	this.Then(/^I get the error message: (.*)$/, function (expectedErrorMsg, next) {
		if (this.errorMsg != expectedErrorMsg)
			throw (new Error("Error message is " + this.errorMsg + " expected " + expectedErrorMsg));
		next();
	});
};

module.exports = validatorServiceTest;