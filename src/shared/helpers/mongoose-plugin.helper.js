module.exports = function (server) {
    'use strict';
    return function (schema, schemaName) {
        server.console.info('PLUGINS on', schemaName, ':');
        Object.keys(server.mongoose.plugins).forEach(function(pluginName) {
            schema.plugin(
                server.mongoose.plugins[pluginName],
                {
                    pluginName: pluginName,
                    schemaName: schemaName
                }
            );
        });
    };
};
