"use strict";

const http = require('http');
const https = require('https');
const httpService = {
  post: function (options) {
    return new Promise((resolve, reject) => {
      const lib = options.protocol.startsWith('https') ? https : http;
      const request = lib.request(options, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error('Failed to load page, status code: ' + response.statusCode));
        }
        const body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      });
      request.on('error', (err) => reject(err))

      request.end(options.json)
    })
  }
};
module.exports = httpService;