module.exports = function (server) {
    'use strict';
    return function (schema, options) {
        server.console.log('   *', 'applying plugin', options.pluginName, 'on', options.schemaName);
        schema.add({
            modifiedAt: Date
        });

        schema.pre('save', function (next) {
            this.modifiedAt = new Date();
            next();
        });
    };
};
