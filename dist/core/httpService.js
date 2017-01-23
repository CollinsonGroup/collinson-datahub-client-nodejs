"use strict";

var request = require("request");

var statusErrors = {
  401: "EUNAUTHORISED",
  404: "ENOTFOUND"
};

var httpService = {
  post: function post(options) {
    return new Promise(function (resolve, reject) {

      request(options, function (err, res, body) {

        if (res && res.statusCode !== 200) {
          var errorMessage = statusErrors[res.statusCode] || response.statusMessage;
          reject(new Error('Failed to publish message. Status code: ' + res.statusCode + ' with status message: ' + errorMessage));
        }

        if (err) {
          reject(new Error('Failed to publish message. Error code: ' + err.code));
        }

        resolve(body);
      });
    });
  }
};
module.exports = httpService;