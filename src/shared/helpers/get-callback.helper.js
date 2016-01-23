module.exports = function (/*server*/) {
    'use strict';
    var _ = require('lodash');
    return function (args) {
        var argArray = new Array(args.length);
        for (var i = 0; i < argArray.length; ++i) {
            //i is always valid index in the arguments object
            argArray[i] = args[i];
        }

        var lastArg = _.last(Array.prototype.slice.call(argArray));
        if ('function' === typeof lastArg) {
            return lastArg;
        } else {
            return function () {};
        }
    };
};
