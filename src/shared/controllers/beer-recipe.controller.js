module.exports = function(server) {
    'use strict';
    var q = require('q');
    var BeerRecipe = server.getModel('BeerRecipe');
    var waterfall = require('promise-waterfall');
    var userConfig = server.config['user-limitation'] ? server.config['user-limitation'] : {};
    var _ = require('lodash');

    /**
     * Read all recipes
     * @param   {Object} user     Curent user
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readRecipes(user, opts /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            BeerRecipe.find({
                user: user
            }, undefined, opts).then(function(recipes) {
                recipes.forEach(function(recipe) {
                    recipe.author = user.name;
                });
                resolve(recipes);
                return callback(null, recipes);
            }, function(err) {
                reject(err);
                callback(err);
            });
        });
    }

    /**
     * Count all recipes
     * @param   {Object} user     Curent user
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function countRecipes(user /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            BeerRecipe.count({
                user: user
            }).then(function(size) {
                resolve(size);
                return callback(null, size);
            }, function(err) {
                reject(err);
                callback(err);
            });
        });
    }

    /**
     * Get an recipe by ID
     * @param {Object} user       Curent user
     * @param {String} id         Recipe Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readRecipeById(user, id /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            BeerRecipe.findOne({
                user: user,
                _id: id
            }).then(function(recipe) {
                resolve(recipe);
                return callback(null, recipe);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Create an ecipe
     * @param   {Object} user       Curent user
     * @param   {Object} recipeData Recipe {name}
     * @param {function} callback   Callback function
     * @returns {Object} Promise
     */
    function createRecipe(user, recipeData /*, callback*/ ) {
        var limit = userConfig['beer-recipe-create'] ? userConfig['beer-recipe-create'] : 50;
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            waterfall(
                [
                    function() {
                        return BeerRecipe.count({user: user});
                    },
                    function(counter) {
                        if (counter<limit) {
                            var beerRecipe = _.extend(
                                new BeerRecipe(),
                                _.pick(
                                    recipeData,
                                    [
                                        'name',
                                        'steps',
                                        'date'
                                    ]
                                )
                            );
                            beerRecipe.user = user;
                            return beerRecipe.save();
                        } else {
                            return q.reject({code:402, status:'Two many recipes'});
                        }
                    }
                ]
            ).then(function(createdRecipe) {
                resolve(createdRecipe);
                return callback(null, createdRecipe);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Delete a recipe
     * @param   {Object} user     Curent user
     * @param   {String} id       Recipe Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteRecipe(user, id /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            BeerRecipe.remove({
                user: user,
                _id: id
            }).then(function(data) {
                resolve(data);
                return callback(null, data);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Update a recipe
     * @param   {Object} user       Curent user
     * @param   {String} id         Recipe Identifier
     * @param   {Object} recipeData Recipe {name, sport, date}
     * @param {function} callback   Callback function
     * @returns {Object} Promise
     */
    function updateRecipe(user, id, recipeData /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            waterfall([
                function() {
                    return readRecipeById(user, id);
                },
                function(recipe) {
                    if (recipeData.name) {
                        recipe.name = recipeData.name;
                    }
                    if (recipeData.steps) {
                        recipe.steps = recipeData.steps;
                    }
                    if (recipeData.date) {
                        recipe.date = recipeData.date;
                    }
                    return recipe.save();
                }
            ]).then(
                function(data) {
                    resolve(data);
                    callback(null, data);
                },
                function(err) {
                    reject(err);
                    callback(err);
                }
            );
        });
    }


    return {
        readRecipes: readRecipes,
        readRecipeById: readRecipeById,
        createRecipe: createRecipe,
        deleteRecipe: deleteRecipe,
        updateRecipe: updateRecipe,
        countRecipes: countRecipes
    };
};
