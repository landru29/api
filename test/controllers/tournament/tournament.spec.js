(function() {
  'use strict';

  var assert = require('chai').assert;
  var testFrame = require('../../test-frame.js');
  var fixtures = require('./tournament.fixture.json');
  var _ = require('lodash');
  var waterfall = require('promise-waterfall');
  var user;

  describe('Tournament: Controller', function() {

    beforeEach(function(done) {
      var tasks = [
        function() {
          return testFrame().controllers.user.readUsers();
        },
        function(userRead) {
          return (user = _.first(userRead));
        }
      ].concat(
        fixtures.map(function(tournamentData) {
          return function() {
            return testFrame().controllers.tournament.createTournament(user._id, tournamentData);
          };
        })
      );
      waterfall(tasks).then(function() {
        done();
      }, function(err) {
        done(err || 'beforeEach');
      });
    });

    describe('#readTournaments', function() {
      it('Should read a tournament', function(done) {
        testFrame().controllers.tournament.readTournaments().then(
          function(tournamentData) {
            assert.isArray(tournamentData);
            assert.equal(tournamentData.length, fixtures.length);
            done()
          },
          function(err) {
            done(err);
          }
        );
      });
    });

    describe('#deleteTournament', function() {
      it('Should delete a tournament', function(done) {
        waterfall([
          function() {
            return testFrame().controllers.tournament.readTournaments(user._id)
          },
          function(tournamentData) {
            return testFrame().controllers.tournament.deleteTournament(user._id, tournamentData[0]._id);
          },
          function() {
            return testFrame().controllers.tournament.readTournaments(user._id);
          }
        ]).then(function(tournaments) {
          assert.equal(tournaments.length, fixtures.length - 1);
          done();
        }, function(err) {
          done(err);
        });
      });
    });

  });
})();
