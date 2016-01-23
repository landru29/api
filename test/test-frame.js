(function () {
    'use strict';
    var mongoose = require('mongoose');
    var waterfall = require('promise-waterfall');
    var config = require('./test-conf.json');
    var q = require('q');
    var App = require('../src/app.js');
    var userFixtures = require('./fixtures/users.fixture.json');

    var globalData;

    process.env.NODE_ENV = 'test';


    /**
     * Clear Test database and recompile mongoose models
     * @param   {Object} mongooseDesc Mongoose descriptor {instance, plugins, schemas}
     * @param {Function} doneClear    Callback
     */
    var clearDb = function (appli, doneClear) {
        var promises = [];
        for (var i in appli.mongoose.instance.connection.collections) {
            promises.push(appli.mongoose.instance.connection.collections[i].remove());
        }
        q.all(promises).then(
            function () {
                appli.reloadModels();
                doneClear();
            },
            function (err) {
                doneClear(err);
            }
        );
    };

    var loadFixtures = function(doneFixture) {
        var tasks = userFixtures.map(function(elt){
          return function() {
            return globalData.controllers.user.createUser(elt);
          }
        });
        waterfall(tasks).then(function() {
          doneFixture();
        }, function(err) {
          doneFixture(err || 'beforeEach');
        });
    };

    beforeEach(function (done) {;
        if (!globalData) {
            var connectionChain = 'mongodb://' +
                config.database.host + ':' +
                config.database.port + '/' +
                config.database.name;
            globalData = new App({
                options: {
                    logQuiet: true,
                    mongooseConnectionChain: connectionChain
                }
            });
            globalData.bootstrap(function () {
                clearDb(globalData, function() {
                    loadFixtures(done);
                });
            });

        } else {
            globalData.connectDb(function () {
                clearDb(globalData, function() {
                    loadFixtures(done);
                });
            });
        }
    });

    afterEach(function (done) {
        mongoose.disconnect();
        return done();
    });

    module.exports = function () {
        return globalData;
    };

})();
