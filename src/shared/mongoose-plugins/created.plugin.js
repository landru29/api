module.exports = function (server) {
    'use strict';
    return function (schema, options) {
        server.console.log('   *', 'applying plugin', options.pluginName, 'on', options.schemaName);
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
