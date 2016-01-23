module.exports = function (folder, pattern, callback, end) {
    'use strict';
    var fs = require('fs');
    var path = require('path');

    var fileList = fs.readdirSync(folder);
    var result = [];
    fileList.map(function (file) {
        return {
            filename: file,
            fullPathname: path.join(folder, file)
        };
    }).filter(function (file) {
        return fs.statSync(file.fullPathname).isFile();
    }).forEach(function (file) {
        if (pattern.test(file.filename)) {
            callback(file);
            result.push(file);
        }
    });
    if (end) {
        end(result);
    }
};
