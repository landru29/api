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
                  function(user1) {
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
                        done();
                    },
                    function (err) {
                        done(err);
                    }
                );
            });
        });

        describe('#readUserById', function () {
            it('Should read a user', function (done) {
                var firstUser;
              waterfall([
                function(){
                  return testFrame().controllers.user.readUsers();
                },
                function(users) {
                    firstUser = _.first(users);
                  return testFrame().controllers.user.readUserById(firstUser.id);
                }
              ]).then(function (user) {
                  assert.equal(user.id, firstUser.id);
                  done();
              }, function (err) {
                  done(err);
              });
            });

            it('Should not read any user (not existing id)', function (done) {
                testFrame().controllers.user.readUserById(123).then(function () {
                    done('Should not resolve');
                }, function () {
                    done();
                });
            });

            it('Should not read any user (bad id)', function (done) {
                testFrame().controllers.user.readUserById('bob').then(function () {
                    done('Should not resolve');
                }, function () {
                    done();
                });
            });
        });

        describe('#deleteUser', function () {
            it('Should delete a user', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.readUsers();
                },
                function(users) {
                  return testFrame().controllers.user.deleteUser(_.first(users).id);
                },
                function(result) {
                  assert.equal(result.ok, 1);
                  return testFrame().controllers.user.readUsers();
                }
              ]).then(function (users) {
                  assert.equal(users.length, fixtures.length + 2 - 1); // 2 users are preloaded
                  done();
              }, function (err) {
                  done(err);
              });
            });

            it('Should not delete any user (not existing id)', function (done) {
              testFrame().controllers.user.deleteUser(123).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

            it('Should not delete any user (bad id)', function (done) {
              testFrame().controllers.user.deleteUser('bob').then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
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
                    return testFrame().controllers.user.updateUser(_.first(users).id, {
                        name: newName
                    });
                },
                function () {
                    return testFrame().controllers.user.readUserById(_.first(users).id);
                }
              ]).then(function (updatedUser) {
                  assert.equal(updatedUser.name, newName);
                  done();
              }, function (err) {
                  done(err);
              });
            });

            it('Should not update any user (not existing id)', function (done) {
              var newName = 'rococo';
              testFrame().controllers.user.updateUser("123", {
                  name: newName
              }).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

            it('Should not update any user (bad id)', function (done) {
              var newName = 'rococo';
              testFrame().controllers.user.updateUser("bob", {
                  name: newName
              }).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });
        });

        describe('#checkUser', function () {
            it('Should check a user', function (done) {
                testFrame().controllers.user.checkUser(fixtures[0].email, fixtures[0].password).then(
                    function (data) {
                        assert.isDefined(data.name);
                        done();
                    },
                    function (err) {
                        done(err);
                    }
                );
            });

            it('Should not check any user (not verified)', function (done) {
                testFrame().controllers.user.checkUser(fixtures[1].email, fixtures[1].password).then(
                    function () {
                        done('Should not resolve');
                    },
                    function () {
                        done();
                    }
                );
            });

            it('Should not check any user (bad password)', function (done) {
                testFrame().controllers.user.checkUser(fixtures[0].email, 'bob' + fixtures[0].password).then(
                    function () {
                        done('Should not resolve');
                    },
                    function () {
                        done();
                    }
                );
            });

            it('Should not check any user (bad login)', function (done) {
                testFrame().controllers.user.checkUser('bob' + fixtures[0].email, fixtures[0].password).then(
                    function () {
                        done('Should not resolve');
                    },
                    function () {
                        done();
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

            it('Should not find any user with inexisting email', function (done) {
                testFrame().controllers.user.findUserByEmail('bob' + fixtures[0].email).then(
                    function () {
                        done('Should not resolve');
                    },
                    function () {
                        done();
                    }
                );
            });

            it('Should not find any user with wrong email', function (done) {
                testFrame().controllers.user.findUserByEmail('bob').then(
                    function () {
                        done('Should not resolve');
                    },
                    function () {
                        done();
                    }
                );
            });
        });

        describe('#signup', function () {
            it('Should signup a user', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.signup('azertyuiop@tre.fr');
                },
                function(createUser) {
                  assert.equal(createUser.verified, false);
                  return testFrame().controllers.user.changePassword(createUser.email, createUser.emailToken, 'toto', 'toto');
                }
              ]).then(function (user) {
                  assert.equal(user.verified, true);
                  done();
              }, function (err) {
                  done(err);
              });
            });

            it('Should not signup the user (not an email)', function (done) {
              testFrame().controllers.user.signup('azertyuiop').then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

            it('Should not signup the user (bad token)', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.signup('azertyuiop@tre.fr');
                },
                function(createUser) {
                  assert.equal(createUser.verified, false);
                  return testFrame().controllers.user.changePassword(createUser.email, 'bob' + createUser.emailToken, 'toto', 'toto');
                }
              ]).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

            it('Should not signup the user (wrong password)', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.signup('azertyuiop@tre.fr');
                },
                function(createUser) {
                  assert.equal(createUser.verified, false);
                  return testFrame().controllers.user.changePassword(createUser.email, createUser.emailToken, 'toto', 'kiki');
                }
              ]).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

            it('Should not signup the user (wrong email)', function (done) {
              waterfall([
                function(){
                  return testFrame().controllers.user.signup('azertyuiop@tre.fr');
                },
                function(createUser) {
                  assert.equal(createUser.verified, false);
                  return testFrame().controllers.user.changePassword('bob' + createUser.email, createUser.emailToken, 'toto', 'toto');
                }
              ]).then(function () {
                  done('Should not resolve');
              }, function () {
                  done();
              });
            });

        });


    });
})();
