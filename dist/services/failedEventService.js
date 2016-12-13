"use strict";

var jsonfile = require('jsonfile'),
    fs = require('fs'),
    path = require("path");

var failedEventService = function failedEventService() {
    function saveFile(event, fileName, filePath) {
        var file = path.join(getFilePath(filePath), fileName);
        jsonfile.writeFile(file, event);
    }

    function deleteFile(fileName, filePath) {
        var file = path.join(getFilePath(filePath), fileName);
        fs.unlink(file);
    }

    function getFilePath(filePath) {
        filePath = filePath || path.join(__dirname, '../data');

        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        return filePath;
    }

    return {
        save: saveFile,
        delete: deleteFile
    };
};

module.exports = failedEventService();