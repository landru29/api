(function() {
  'use strict';

  var assert = require('chai').assert;
  var testFrame = require('../../test-frame.js');
  var fixtures = require('./beer-recipe.fixture.json');
  var _ = require('lodash');
  var waterfall = require('promise-waterfall');
  var user;

  describe('BeerRecipe: Controller', function() {

    beforeEach(function(done) {
      var tasks = [
        function() {
          return testFrame().controllers.user.readUsers();
        },
        function(userRead) {
          return (user = _.first(userRead));
        }
      ].concat(
        fixtures.map(function(recipeData) {
          return function() {
            return testFrame().controllers.beerRecipe.createRecipe(user.id, recipeData);
          };
        })
      );
      waterfall(tasks).then(function() {
        done();
      }, function(err) {
        done(err || 'beforeEach');
      }).catch(function (error) {
          done(error);
      });
    });

    describe('#readRecipes', function() {
      it('Should read a recipe', function(done) {
        testFrame().controllers.beerRecipe.readRecipes(user.id).then(
          function(recipeData) {
            assert.isArray(recipeData);
            recipeData.forEach(function(elt) {
              assert.isArray(elt.steps);
              assert.isString(elt.author);
            });
            assert.equal(recipeData.length, fixtures.length);
            done();
          },
          function(err) {
            done(err);
          }
        ).catch(function (error) {
            done(error);
        });
      });
    });

    describe('#deleteRecipe', function() {
      it('Should delete a recipe', function(done) {
        waterfall([
          function() {
            return testFrame().controllers.beerRecipe.readRecipes(user.id);
          },
          function(recipeData) {
            return testFrame().controllers.beerRecipe.deleteRecipe(user.id, recipeData[0].id);
          },
          function() {
            return testFrame().controllers.beerRecipe.readRecipes(user.id);
          }
        ]).then(function(recipes) {
          assert.equal(recipes.length, fixtures.length - 1);
          done();
        }, function(err) {
          done(err);
        }).catch(function (error) {
            done(error);
        });
      });
    });

  });
})();
