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
        controller.readRecipes(req.user, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Read one recipe
     * @name /read/:id
     * @method GET
     * @role user
     * @role admin
     * @param {String} id @url @required Recipe ID
     */
    router.get('/read/:id', function (req, res) {
        controller.readRecipeById(req.user, req.params.id, function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Create a recipe
     * @name /
     * @method POST
     * @role user
     * @role admin
     * @param {String} name   @body @required Recipe name
     * @param {String} date   @body           Recipe date
     * @param {String} steps  @body           Recipe steps (JSON)
     */
    router.post('/', function (req, res) {
        controller.createRecipe(req.user, {
            name: req.body.name,
            date: req.body.date,
            steps: 'string' === typeof req.body.steps ? JSON.parse(req.body.steps) : req.body.steps
        } , function(err, data) {
            server.helpers.response(req, res, err, data);
        });
    });

    /**
     * Delete a recipe
     * @name /:id
     * @method DELETE
     * @param {String} id @url @required Recipe ID
     * @role user
     * @role admin
     */
    router.delete('/:id', function (req, res) {
        controller.deleteRecipe(req.user, req.params.id, function(err) {
            server.helpers.response(req, res, err, null, {message: {success: 'Recipe deleted'}});
        });
    });

    /**
     * Update a recipe
     * @name /:id
     * @method PUT
     * @param {String}  id          @url  @required  Recipe ID
     * @param {String}  name        @body            Recipe name
     * @param {String}  date        @body            Recipe date
     * @param {Boolean} steps       @body            steps
     * @role admin
     * @role user
     */
    router.put('/:id', function (req, res) {
        controller.updateRecipe(req.user, req.params.id, {
            name: req.body.name,
            date: req.body.date,
            steps: req.body.steps
        }, function(err, data) {
            server.helpers.response(req, res, err, data, {message: {success: 'Recipe updated'}});
        });
    });

    return router;
};
