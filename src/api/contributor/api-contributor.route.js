module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    router.use(
        server.middlewares.passport.authenticate('token-login', { session: false })
    );
    router.use(server.middlewares.acl);

    /**
     * @followRoute ./quizz/api-contributor-quizz.route.js
     * @name        quizz
     */
    router.use('/quizz', require('./quizz/api-contributor-quizz.route.js')(server));

    return router;
};
