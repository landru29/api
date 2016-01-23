module.exports = function (server) {
    'use strict';
    return function (model) {
        for (var name in server.mongoosePlugins) {
            if (server.mongoosePlugins.hasOwnProperty(name)) {
                server.log.info('   *', 'applying plugin ' + name);
                model.plugin(server.mongoosePlugins[name], {});
            }
        }
    };
};
