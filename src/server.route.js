module.exports = function(server) {
    'use strict';

    var url = require('url');
    var _ = require('lodash');


    // =====================================
    // API MAIN ENTRY ======================
    // =====================================
    /**
     * @followRoute ./api/api.route.js
     * @name        api
     */
    server.app.use('/api',
        require('./api/api.route.js')(server)
    );


    // =====================================
    // INTERACTIVE DOC =====================
    // =====================================
    server.app.use('/doc', server.middlewares.fileServer(server.rootFolder + '/doc'));


    // =====================================
    // LOCAL PAGES =========================
    // =====================================
    server.helpers.loader(__dirname + '/ctrl', /\.ctrl\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        server.console.info('CTRL:', 'Loading', name);
        require(file.fullPathname)(server);
    });

};
