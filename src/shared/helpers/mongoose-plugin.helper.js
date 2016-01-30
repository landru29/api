module.exports = function (server) {
    'use strict';
    return function (schema) {
        Object.keys(server.mongoose.plugins).forEach(function(pluginName) {
            console.log('   *', 'applying plugin ' + pluginName);
            schema.plugin(server.mongoose.plugins[pluginName], {});
        });
    };
};
