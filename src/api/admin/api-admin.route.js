module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();


    router.use(
        server.middlewares.passport.authenticate('token-login', { session: false })
    );
    router.use(server.middlewares.acl);



    /**
     * @followRoute ./user/api-admin-user.route.js
     * @name        user
     */
    router.use('/user', require('./user/api-admin-user.route.js')(server));

    /**
     * @followRoute ./application/api-admin-application.route.js
     * @name        application
     */
    router.use('/application', require('./application/api-admin-application.route.js')(server));

    return router;
};
