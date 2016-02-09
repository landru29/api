(function() {
    'use strict';

    var assert = require('chai').assert;
    var testFrame = require('../../test-frame.js');
    var fixtures = require('./application.fixture.json');
    var _ = require('lodash');
    var waterfall = require('promise-waterfall');


    describe('Application: Controller', function() {
        beforeEach(function(done) {
            waterfall(fixtures.map(function(appli) {
                return function() {

                    return testFrame().controllers.application.createApplication(appli);
                };
            })).then(function() {
                done();
            }, function(err) {
                done(err || 'beforeEach');
            });
        });

        describe('#createApplication', function() {
            it('Should create an application', function(done) {
                return testFrame().controllers.application.createApplication({
                    name: 'mickey'
                }).then(
                    function(appli) {
                        assert.isDefined(appli);
                        assert.isDefined(appli.name);
                        done();
                    },
                    function(err) {
                        done(err);
                    });
            });
            it('Should reject the creation of the same application', function(done) {
                return waterfall([
                    function() {
                        return testFrame().controllers.application.createApplication({
                            name: 'mickey'
                        });
                    },
                    function(appli) {
                        assert.isDefined(appli);
                        return testFrame().controllers.application.createApplication({
                            name: 'mickey',
                        });
                    }
                ]).then(function() {
                        done('Should not create the second application');
                    },
                    function(err) {
                        assert.isDefined(err);
                        done();
                    });
            });
        });

        describe('#readApplications', function() {
            it('Should read an application', function(done) {
                return testFrame().controllers.application.readApplications().then(
                    function(appli) {
                        assert.isArray(appli);
                        assert.equal(appli.length, fixtures.length);
                        done();
                    },
                    function(err) {
                        done(err);
                    }
                );
            });
        });

        describe('#readApplicationById', function() {
            it('Should read an application', function(done) {
                var firstApplication;
                return waterfall([
                    function() {
                        return testFrame().controllers.application.readApplications();
                    },
                    function(applis) {
                        firstApplication = _.first(applis);
                        return testFrame().controllers.application.readApplicationById(firstApplication.id);
                    }
                ]).then(function(application) {
                    assert.equal(application.id, firstApplication.id);
                    done();
                }, function(err) {
                    done(err);
                });
            });
        });

        describe('#readApplicationByName', function() {
            it('Should read an application', function(done) {
                var firstApplication;
                return waterfall([
                    function() {
                        return testFrame().controllers.application.readApplications();
                    },
                    function(applis) {
                        firstApplication = _.first(applis);
                        return testFrame().controllers.application.readApplicationByName(firstApplication.name);
                    }
                ]).then(function(application) {
                    assert.equal(application.id, firstApplication.id);
                    done();
                }, function(err) {
                    done(err);
                });
            });
        });

        describe('#deleteApplication', function() {
            it('Should delete an application', function(done) {
                return waterfall([
                    function() {
                        return testFrame().controllers.application.readApplications();
                    },
                    function(applis) {
                        return testFrame().controllers.application.deleteApplication(_.first(applis).id);
                    },
                    function() {
                        return testFrame().controllers.application.readApplications();
                    }
                ]).then(function(applications) {
                    assert.equal(applications.length, fixtures.length - 1);
                    done();
                }, function(err) {
                    done(err);
                });
            });
        });

        describe('#updateApplication', function() {
            it('Should update an application', function(done) {
                var applis;
                var newName = 'rococo';
                return waterfall([
                    function() {
                        return testFrame().controllers.application.readApplications();
                    },
                    function(applisRead) {
                        applis = applisRead;
                        return testFrame().controllers.application.updateApplication(_.first(applis).id, {
                            name: newName
                        });
                    },
                    function() {
                        return testFrame().controllers.application.readApplicationById(_.first(applis).id);
                    }
                ]).then(function(updatedAppli) {
                    assert.equal(updatedAppli.name, newName);
                    done();
                }, function(err) {
                    done(err);
                });
            });
        });

    });
})();
