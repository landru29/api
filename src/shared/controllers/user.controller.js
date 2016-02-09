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

        var tasks = appId.filter(function(app) {
            return /^[0-9a-fA-F]{24}$/.test(app);
        })
        .map(function(app) {
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
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            User.find().then(function(users){
                resolve(users);
                return callback(null, users);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Get a user by ID
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUserById(id /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            User.findById(id).then(function(user){
                resolve(user);
                return callback(null, user);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Create a user
     * @param {Object}   userData User {name, email, password}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function createUser(userData /*, callback*/ ) {
        server.console.log('Creating user');
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
        if (userData.emailToken) {
            user.generateEmailToken();
        }

        var tasks = [
            function(applications) {
                if (applications) {
                    var filteredApplications = applications.filter(function(app) {
                        return !!app;
                    });
                    server.console.log('applications', filteredApplications);
                    user.applications = filteredApplications;
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

        return q.promise(function(resolve, reject) {
            waterfall(tasks).then(function(user) {
                server.console.log('User creation success');
                callback(null, user);
                resolve(user);
            }, function(err) {
                server.console.error('User creation error', err);
                callback(err);
                reject(err);
            });
        });
    }

    /**
     * Delete a user
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteUser(id /*, callback*/ ) {
        server.console.log('Deleting user');
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject){
            User.remove({
                _id: id
            }).then(function(result) {
                resolve(result.result);
                return callback(null, result.result);
            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    /**
     * Update a user
     * @param {String} id         User Identifier
     * @param {Object}   userData User {name, email, password, delAppId, addAppId}
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function updateUser(id, userData /*, callback*/ ) {
        server.console.log('Updating user');
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
        server.console.log('Checking user');
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
        server.console.log('Finding user by email', email);
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject){
            User.find({
                email: email
            }).then(function(users) {
                var currentUser = _.first(users);
                if (users.length === 1) {
                    resolve(currentUser);
                    return callback(null, currentUser);
                } else {
                    reject('User not found');
                    return callback('User not found');
                }
            }, function(err) {
                server.console.log('Error while searching by email');
                reject(err);
                return callback(err);
            });
        });
    }

    /**
    * Signup a user
    * @param   {String} email User email
    * @param   {String} appId Application Identifier
    * @returns {Object} Promise
    */
    function signup(email, appId /*, callback*/) {
        server.console.log('Signing up a user');
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject) {
            server.console.log('Looking for users');
            findUserByEmail(email, function(err, user) {
                if ((err) && (err !== 'User not found')) {
                    server.console.log('Error !', '[' + err + ']');
                    reject(err);
                    return callback(err || 'What happened ?');
                }

                var tasks = [
                    function() {
                        return createUser({
                            email: email,
                            password: generatePassword(20, false),
                            applications:[appId],
                            emailToken: true
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
                    server.console.log('Signup success !');
                    resolve(newUser);
                    return callback(null, newUser);
                }, function(err) {
                    server.console.error('Signup fail !');
                    reject(err);
                    return callback(err);
                });
            });
        });
    }

    /**
    * Update the password of a user and set verified flag
    * @param   {String} email     User email
    * @param   {String} token     Token provided by email
    * @param   {String} password  New password
    * @param   {String} password1 Repeat new password
    * @returns {Object} Promise
    */
    function changePassword(email, token, password, password1) {
        server.console.log('Change the password of a user');
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject){
            waterfall([
                function() {
                    server.console.log('Passwords equals ?');
                    return q.promise(function(resolve_, reject_) {
                        if (password !== password1) {
                            server.console.warn('no');
                            reject_('Passwords are not equals');
                        }
                        resolve_();
                    });
                },
                function() {
                    return findUserByEmail(email);
                },
                function(user) {
                    return q.promise(function(resolve_, reject_) {
                        if (user.emailToken !== token) {
                            return reject_('Bad token');
                        }
                        return resolve_(user);
                    });
                },
                function(user) {
                    server.console.log('Update user');
                    user.verified = true;
                    user.password = password;
                    return user.save();
                }
            ]).then(function(user) {
                callback(null, user);
                return resolve(user);
            }, function(err) {
                callback(err);
                return reject(err);
            });
        });
    }

    return {
        getApplications: getApplications,
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById,
        checkUser: checkUser,
        findUserByEmail: findUserByEmail,
        signup: signup,
        changePassword: changePassword,
        checkFacebookUser: require('./user.facebook.include.js')(server),
        checkGoogleUser: require('./user.google.include.js')(server)
    };
};
