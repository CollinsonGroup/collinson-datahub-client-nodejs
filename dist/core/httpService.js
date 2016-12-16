"use strict";

var http = require('http');
var https = require('https');
var httpService = {
  post: function post(options) {
    return new Promise(function (resolve, reject) {
      var lib = options.protocol.startsWith('https') ? https : http;
      var request = lib.request(options, function (response) {
        if (response.statusCode !== 200) {
          reject(new Error('Message publish failed with status code: ' + response.statusCode + ' and status message: ' + response.statusMessage));
        }
        var body = [];
        response.on('data', function (chunk) {
          return body.push(chunk);
        });
        response.on('end', function () {
          return resolve(body.join(''));
        });
      });

      request.on('error', function (err) {
        return reject(new Error('Message publish failed with error code: ' + err.code));
      });

      request.end(options.json);
    });
  }
};
module.exports = httpService;