module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.beerRecipe;

    /**
     * Read All recipe
     * @name /list
     * @method GET
     * @role user
     * @role admin
     */
    router.get('/list', function (req, res) {
        controller.readRecipes(req.user.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    return router;
};
