(function () {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./user.fixture.json');
    var _ = require('lodash');
    var waterfall = require('promise-waterfall');


    describe('User: Controller', function () {

        beforeEach(function (done) {
          waterfall(
            fixtures.map(function (user) {
                return function() {
                    return testFrame().controllers.user.createUser(user);
                };
            })
          ).then(function () {
              done();
          }, function (err) {
              done(err || 'beforeEach');
          });
        });

        describe('#createUser', function () {
            it('Should create a user', function (done) {
                testFrame().controllers.user.createUser({
                    name: 'mickey',
                    email: 'mickey@mouse.com',
                    password: 'plutot'
                }).then(
                    function (user) {
                        try {
                            assert.isDefined(user);
                            assert.isDefined(user.name);
                        } catch (e) {
                            done(e);
                        }
                        done();
                    },
                    function (err) {
                        done(err);
                    });
            });
            it('Should reject the creation of the same user', function (done) {
                waterfall([
                  function() {
                    return testFrame().controllers.user.createUser({
                        name: 'mickey',
                        email: 'mickey@mouse.com',
                        password: 'plutot'
                    });
                  },
                  function() {
                      return testFrame().controllers.user.createUser({
                          name: 'minnie',
                          email: user1.email,
                          password: 'dingo'
                      });
                    }
                ]).then(function(){
                    done('Should not create the second user');
                }, function(err){
                    try {
                        assert.isDefined(err);
                    } catch (e) {
                        done(e);
                    }
                    done();
                });
            });
        });

        describe('#readUsers', function () {
            it('Should read a user', function (done) {
                testFrame().controllers.user.readUsers().then(
                    function (users) {
                        assert.isArray(users);
                        assert.equal(users.length, fixtures.length + 2); // 2 users are preloaded
                        done()
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#deleteUser', function () {
            it('Should delete a user', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.readUsers();
                },
                function(users) {
                  return testFrame().controllers.user.deleteUser(_.first(users)._id);
                },
                function() {
                  return testFrame().controllers.user.readUsers();
                }
              ]).then(function (users) {;
                  assert.equal(users.length, fixtures.length + 2 - 1); // 2 users are preloaded
                  done();
              }, function (err) {
                  done(err);
              });
            });
        });

        describe('#updateUser', function () {
            it('Should update a user', function (done) {
              var users;
              var newName = 'rococo';
              waterfall([
                function() {
                    return testFrame().controllers.user.readUsers();
                },
                function (usersRead) {
                  users = usersRead;
                    return testFrame().controllers.user.updateUser(_.first(users)._id, {
                        name: newName
                    });
                },
                function () {
                    return testFrame().controllers.user.readUserById(_.first(users)._id);
                }
              ]).then(function (updatedUser) {
                  assert.equal(updatedUser.name, newName);
                  done();
              }, function (err) {
                  done(err);
              });
            });
        });

        describe('#checkUser', function () {
            it('Should check a user', function (done) {
                testFrame().controllers.user.checkUser(fixtures[0].email, fixtures[0].password).then(
                    function (data) {
                        assert.isDefined(data['access-token']);
                        done();
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#findUserByEmail', function () {
            it('Should find a user with its email', function (done) {
                testFrame().controllers.user.findUserByEmail(fixtures[0].email).then(
                    function (data) {
                        assert.isDefined(data.name);
                        done();
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });
    });
})();
