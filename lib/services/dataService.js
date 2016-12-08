"use strict";

const jsonfile = require('jsonfile'),
    fs = require('fs'),
    path = require("path");

const dataService = {
    save: function(eventJson) {
        let file =  path.join(this.getFilePath(),'data.json');
        jsonfile.readFile(file, function(err, array) {
            array = array || [];
            array.push(eventJson);
            jsonfile.writeFile(file, array)
        });
    },
    getFilePath()
    {
        let filePath = path.join(__dirname, '../data');
        if (!fs.existsSync(filePath)){
            fs.mkdirSync(filePath);
        }
        return filePath;
    }
};

module.exports = dataService;