module.exports = function(server) {
  'use strict';
  var q = require('q');
  var BeerRecipe = server.getModel('BeerRecipe');
  var _ = require('lodash');
  var waterfall = require('promise-waterfall');


  /**
   * Read all recipes
   * @param   {String} userId   Curent user
   * @param {function} callback Callback function
   * @returns {Object} Promise
   */
  function readRecipes(userId /*, callback*/ ) {
    var filter = userId ? {
      userId: userId
    } : undefined;
    var callback = server.helpers.getCallback(arguments);
    return q.promise(function(resolve, reject) {
      q.all([
        server.controllers.user.readUserById(userId),
        BeerRecipe.find(filter)
      ]).then(function(data) {
        data[1].forEach(function(recipe) {
          recipe.author = data[0].name;
        });
        resolve(data[1]);
        callback(null, data[1]);
      }, function(err) {
        reject(err);
        callback(err);
      });
    });
  }

  /**
   * Get an recipe by ID
   * @param {String} userId     Curent user
   * @param {String} id         Recipe Identifier
   * @param {function} callback Callback function
   * @returns {Object} Promise
   */
  function readRecipeById(userId, id /*, callback*/ ) {
    var callback = server.helpers.getCallback(arguments);
    var filter = {
      _id: id
    };
    if (userId) {
      filter.userId = userId;
    }
    return q.promise(function(resolve, reject) {
      BeerRecipe.find(filter, function(err, list) {
        callback(err, _.first(list));
      }).then(
        function(data) {
          resolve(_.first(data));
        },
        function(err) {
          reject(err);
        }
      );
    });
  }

  /**
   * Create an ecipe
   * @param   {String} userId     Curent user
   * @param   {Object} recipeData Recipe {name}
   * @param {function} callback   Callback function
   * @returns {Object} Promise
   */
  function createRecipe(userId, recipeData /*, callback*/ ) {
    var callback = server.helpers.getCallback(arguments);
    return q.promise(function(resolve, reject) {
      var beerRecipe = new BeerRecipe();
      beerRecipe.name = recipeData.name;
      beerRecipe.steps = recipeData.steps;
      beerRecipe.userId = userId;
      beerRecipe.save(function(err, createdRecipe) {
        if (!err) {
          resolve(createdRecipe);
          callback(null, createdRecipe);
        } else {
          reject(err);
          callback(err);
        }
      });
    });
  }

  /**
   * Delete a recipe
   * @param   {String} userId   Curent user
   * @param   {String} id       Recipe Identifier
   * @param {function} callback Callback function
   * @returns {Object} Promise
   */
  function deleteRecipe(userId, id /*, callback*/ ) {
    var filter = {
      _id: id
    };
    if (userId) {
      filter.userId = userId;
    }
    var callback = server.helpers.getCallback(arguments);
    return BeerRecipe.remove(filter, callback);
  }

  /**
   * Update a recipe
   * @param   {String} userId     Curent user
   * @param   {String} id         Recipe Identifier
   * @param   {Object} recipeData Recipe {name, sport, date}
   * @param {function} callback   Callback function
   * @returns {Object} Promise
   */
  function updateRecipe(userId, id, recipeData /*, callback*/ ) {
    var callback = server.helpers.getCallback(arguments);
    return q.promise(function(resolve, reject) {
      waterfall([
        function() {
          return readRecipeById(userId, id);
        },
        function(recipe) {
          if (recipeData.name) {
            recipe.name = recipeData.name;
          }
          if (recipeData.steps) {
            recipe.steps = recipeData.steps;
          }
          return recipe.save();
        }
      ]).then(
        function(data) {
          resolve(data);
          callback(null, data);
        }, function(err) {
          reject(err);
          callback(err);
        }
      );
      /*readRecipeById(userId, id).then(
        function(recipe) {
          if (recipeData.name) {
            recipe.name = recipeData.name;
          }
          if (recipeData.steps) {
            recipe.steps = recipeData.steps;
          }
          recipe.save(callback).then(function(data) {
            resolve(data);
            callback(null, data);
          }, function(err) {
            reject(err);
            callback(err);
          });
        },
        function(err) {
          reject(err);
          return callback(err);
        }
      );*/
    });
  }


  return {
    readRecipes: readRecipes,
    readRecipeById: readRecipeById,
    createRecipe: createRecipe,
    deleteRecipe: deleteRecipe,
    updateRecipe: updateRecipe
  };
};
