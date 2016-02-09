module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    router.use(
        server.middlewares.passport.authenticate('token-login', { session: false })
    );
    router.use(server.middlewares.acl);

    /**
     * @followRoute ./tournament/api-me-tournament.route.js
     * @name        tournament
     */
    router.use('/tournament', require('./tournament/api-me-tournament.route.js')(server));

    /**
     * @followRoute ./beer/api-me-beer.route.js
     * @name        beer
     */
    router.use('/beer', require('./beer/api-me-beer.route.js')(server));

    return router;
};
