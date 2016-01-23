module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.beerRecipe;

    /**
     * Read All recipe
     * @name /
     * @method GET
     * @role user
     */
    router.get('/list', function (req, res) {
        controller.readRecipes(req.getUserId(), function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    return router;
};
