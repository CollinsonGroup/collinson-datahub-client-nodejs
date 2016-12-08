"use strict";

var jsonfile = require('jsonfile'),
    fs = require('fs'),
    path = require("path");

var dataService = {
    save: function save(eventJson) {
        var file = path.join(this.getFilePath(), 'data.json');
        jsonfile.readFile(file, function (err, array) {
            array = array || [];
            array.push(eventJson);
            jsonfile.writeFile(file, array);
        });
    },
    getFilePath: function getFilePath() {
        var filePath = path.join(__dirname, '../data');
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        return filePath;
    }
};

module.exports = dataService;