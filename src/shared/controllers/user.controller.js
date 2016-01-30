module.exports = function(server) {
    'use strict';
    var User = server.getModel('User');
    var _ = require('lodash');
    var q = require('q');
    var waterfall = require('promise-waterfall');
    var generatePassword = require('password-generator');

    function getApplications(user) {
        var appId = [];
        if (user.applications) {
            appId = (_.isArray(user.applications) ? user.applications : [user.applications]);

        }

        var tasks = appId.map(function(app) {
            return server.controllers.application.readApplicationById(app);
        });
        return q.all(tasks);
    }

    /**
     * Read all users
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUsers( /*, callback*/ ) {
        return User.find(server.helpers.getCallback(arguments));
    }

    /**
     * Get a user by ID
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUserById(id /*, callback*/ ) {
        return User.findById(id, server.helpers.getCallback(arguments));
    }

    /**
     * Create a user
     * @param {Object}   userData User {name, email, password}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createUser(userData /*, callback*/ ) {
        server.console.log("Creating user");
        var callback = server.helpers.getCallback(arguments);
        var user = new User();
        user.verified = !!userData.verified;
        user.name = userData.name;
        user.email = userData.email;
        user.password = userData.password;
        user.active = true;
        if (userData.role) {
            user.role = userData.role;
        }

        var tasks = [
            function(applications) {
                if (applications) {
                    user.applications = applications.filter(function(app) {
                        return !!app;
                    });
                }
                return user.save();
            }
        ];

        if (userData.applications) {
            tasks.unshift(
                function() {
                    return getApplications(userData);
                }
            );
        }

        return waterfall(tasks).then(function(user) {
            server.console.log('User creation success');
            callback(null, user);
            return user;
        }, function(err) {
            server.console.error('User creation error');
            callback(err);
            return err;
        });

    }

    /**
     * Delete a user
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteUser(id /*, callback*/ ) {
        server.console.log("Deleting user");
        return User.remove({
            _id: id
        }, server.helpers.getCallback(arguments));
    }

    /**
     * Update a user
     * @param {String} id         User Identifier
     * @param {Object}   userData User {name, email, password, delAppId, addAppId}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function updateUser(id, userData /*, callback*/ ) {
        server.console.log("Updating user");
        var callback = server.helpers.getCallback(arguments);
        return waterfall([
            function() {
                return User.findById(id, function(err, user) {
                    if (err) {
                        return callback(err, user);
                    }
                });
            },
            function(user) {
                _.extend(
                    user,
                    server.helpers.cleanObject(
                        userData,
                        ['name', 'verified', 'password', 'role']
                    )
                );
                if (userData.addAppId) {
                    user.applications = user.applications.concat(getApplications(userData));
                }
                if (userData.delAppId) {
                    user.applications = user.applications.map(function(application) {
                        return (user.applications.indexOf(application) < 0);
                    });
                }
                return user.save(callback).then(function(data) {
                    callback(null, data);
                }, function(err) {
                    callback(err);
                });
            }
        ]);
    }

    /**
     * Check a user with its email and password
     * @param   {String} email    User email
     * @param   {String} password User password
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function checkUser(email, password /*, callback*/ ) {
        server.console.log("Checking user");
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            findUserByEmail(email).then(function(user) {
                if ((user.checkUser(password)) && (user.verified)) {
                    resolve(user);
                    return callback(null, user);
                } else {
                    reject('Failed to login');
                    return callback('Failed to login');
                }
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Get User by email
     * @param   {String} email User email
     * @returns {Object} Promise
     */
    function findUserByEmail(email /*, callback*/ ) {
        server.console.log("Finding user by email");
        var callback = server.helpers.getCallback(arguments);
        return User.find({
            email: email
        }).then(
            function(users) {
                var currentUser = _.first(users);
                if (users.length === 1) {
                    callback(null, currentUser);
                    return currentUser;
                } else {
                    callback('User not found');
                    return 'User not found';
                }
            },
            function(err) {
                callback(err);
                return err;
            }
        );
    }

    function signup(email, appId /*, callback*/) {
        server.console.log("Signing up a user");
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            server.console.log("Looking for users");
            findUserByEmail(email, function(err, user) {
                if ((err) && (err !== 'User not found')) {
                    console.log("Error !", "[" + err + "]");
                    reject(err);
                    return callback(err || 'What happened ?');
                }

                var tasks = [
                    function() {
                        return createUser({
                            email: email,
                            password: generatePassword(20, false),
                            applications:[appId]
                        });
                    }
                ];

                if ((user) && (!user.verified)) {
                    tasks.unshift(
                        function() {
                            return deleteUser(user.id);
                        }
                    );
                }

                return waterfall(tasks).then(function(newUser) {
                    server.console.log("Signup success !");
                    resolve(newUser);
                    return callback(null, newUser);
                }, function(err) {
                    server.console.error("Signup fail !");
                    reject(err);
                    return callback(err);
                });
            });
        });
    }


    return {
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById,
        checkUser: checkUser,
        findUserByEmail: findUserByEmail,
        signup: signup
    };
};
