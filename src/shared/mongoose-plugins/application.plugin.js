module.exports = function (server) {
    'use strict';
    var mongoose = require('mongoose');
    return function (schema, options) {
        if (options.schemaName === 'User') {
            server.console.log('   *', 'applying plugin', options.pluginName, 'on', options.schemaName);
            schema.add({
                applications: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Application'
                }]
            });
        }
    };
};
