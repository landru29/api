module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.tournament;

    /**
     * Read All tournaments
     * @name /
     * @method GET
     * @role user
     */
    router.get('/', function (req, res) {
        controller.readTournaments(req.getUserId(), function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    return router;
};
