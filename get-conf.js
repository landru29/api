(function(){
    'use strict';
    var config = require('./config.json');

    var result = ['']
        .concat(process.argv.slice(2))
        .reduce(function (strData, val) {
            return strData + eval('config.' + val)
        });

    console.log(result);


})();
