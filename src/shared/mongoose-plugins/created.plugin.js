module.exports = function (/*server*/) {
    'use strict';
    return function (schema) {
        schema.add({
            createdAt: {
                type: Date,
                default: function() {
                    return new Date();
                }
            }
        });

    };
};
