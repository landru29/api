module.exports = function (/*server*/) {
    'use strict';
    return function (obj, fields) {
        var result = {};
        fields.forEach(function(field) {
            if (obj.hasOwnProperty(field)) {
                result[field] = obj[field];
            }
        });
        return result;
    };
};
