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
            return testFrame().controllers.beerRecipe.createRecipe(user, recipeData);
          };
        })
      );
      waterfall(tasks).then(function() {
        done();
      }, function(err) {
        done(err || 'beforeEach');
      });
    });

    describe('#readRecipes', function() {
      it('Should read a recipe', function(done) {
        return testFrame().controllers.beerRecipe.readRecipes(user).then(
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
        );
      });
    });

    describe('#createRecipes', function() {
      it('Should block after 5 recipes', function(done) {
          waterfall([
              function() {
                  return testFrame().controllers.beerRecipe.createRecipe(user, {
                      name: "name1",
                      date: new Date()
                  });
              },
              function() {
                  return testFrame().controllers.beerRecipe.createRecipe(user, {
                      name: "name2",
                      date: new Date()
                  });
              },
              function() {
                  return testFrame().controllers.beerRecipe.createRecipe(user, {
                      name: "name3",
                      date: new Date()
                  });
              },
              function() {
                  return testFrame().controllers.beerRecipe.createRecipe(user, {
                      name: "name4",
                      date: new Date()
                  });
              },
          ]).then(function() {
              done('Should have blocked');
          }, function() {
              done();
          });
      });
    });

    describe('#deleteRecipe', function() {
      it('Should delete a recipe', function(done) {
        return waterfall([
          function() {
            return testFrame().controllers.beerRecipe.readRecipes(user);
          },
          function(recipeData) {
            return testFrame().controllers.beerRecipe.deleteRecipe(user, recipeData[0].id);
          },
          function() {
            return testFrame().controllers.beerRecipe.readRecipes(user);
          }
        ]).then(function(recipes) {
          assert.equal(recipes.length, fixtures.length - 1);
          done();
        }, function(err) {
          done(err);
        });
      });
    });

  });
})();
