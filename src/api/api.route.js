module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();

    router.use(server.middlewares.cors);

    /**
     * @method GET
     * @public
     * @role -
     * @name        /
     */
    router.get('/', function(req, res) {
        res.status(200).json(server.meta);
    });

    /**
     * @followRoute ./admin/api-admin.route.js
     * @name        admin
     */
    router.use('/admin', require('./admin/api-admin.route.js')(server));

    /**
     * @followRoute ./me/api-me.route.js
     * @name        me
     */
    router.use('/me', require('./me/api-me.route.js')(server));

    /**
     * @followRoute ./public/api-public.route.js
     * @name        public
     */
    router.use('/public', require('./public/api-public.route.js')(server));

    /**
     * @followRoute ./contributor/api-contributor.route.js
     * @name        contributor
     */
    router.use('/contributor', require('./contributor/api-contributor.route.js')(server));

    return router;
};
