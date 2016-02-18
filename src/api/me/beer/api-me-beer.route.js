module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.beerRecipe;
    var _ = require('lodash');
    var q = require('q');

    /**
     * Read All recipe
     * @name /list
     * @method GET
     * @param {String} page @url Page number
     * @param {String} perPage @url Page length
     * @role user
     * @role admin
     */
    router.get('/list', function (req, res) {
        var opts;
        if ((!_.isUndefined(req.query.page)) || (!_.isUndefined(req.query.perPage))) {
            var perPage = !_.isUndefined(req.query.perPage) ? req.query.perPage : 5;
            var page = req.query.page ? req.query.page : 1;
            opts = {
                limit: perPage,
                skip: (page -1) * perPage
            };
        }
        q.all([
            controller.readRecipes(req.user, opts),
            controller.countRecipes(req.user)
        ]).then(function(data) {
            if (opts) {
                opts.count = data[1];
            }
            //server.console.log(data[0]);
            var recipes = data[0].map(function(recipe) {
                return {
                    author: req.user.name,
                    steps: recipe.steps,
                    date: recipe.date,
                    modifiedAt: recipe.modifiedAt,
                    createdAt: recipe.createdAt,
                    name: recipe.name,
                    id: recipe.id
                };
            });
            server.helpers.response(req, res, null, recipes, {pagination: opts});
        }, function(err) {
            server.helpers.response(req, res, err, null);
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
            var recipe =  (_.isObject(data)) ? {
                author: req.user.name,
                steps: data.steps,
                date: data.date,
                modifiedAt: data.modifiedAt,
                createdAt: data.createdAt,
                name: data.name,
                id: data.id
            } : data;
            server.helpers.response(req, res, err, recipe);
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
            server.console.log('ERROR', err);
            var recipe =  (_.isObject(data)) ? {
                author: req.user.name,
                steps: data.steps,
                date: data.date,
                modifiedAt: data.modifiedAt,
                createdAt: data.createdAt,
                name: data.name,
                id: data.id
            } : data;
            server.helpers.response(req, res, err, recipe);
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
     * @param {String} steps        @body            steps
     * @role admin
     * @role user
     */
    router.put('/:id', function (req, res) {
        controller.updateRecipe(req.user, req.params.id, {
            name: req.body.name,
            date: req.body.date,
            steps: req.body.steps
        }, function(err, data) {
            var recipe =  (_.isObject(data)) ? {
                author: req.user.name,
                steps: data.steps,
                date: data.date,
                modifiedAt: data.modifiedAt,
                createdAt: data.createdAt,
                name: data.name,
                id: data.id
            } : data;
            server.helpers.response(req, res, err, recipe, {message: {success: 'Recipe updated'}});
        });
    });

    return router;
};
