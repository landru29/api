module.exports = function (server) {
    'use strict';
    var mongoose = require('mongoose');
    return function (schema, options) {
        if (options.schemaName === 'BeerRecipe') {
            server.console.log('   *', 'applying plugin', options.pluginName, 'on', options.schemaName);
            schema.add({
                user: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }]
            });
        }
    };
};
