module.exports = function(server) {
    'use strict';
    var User = server.getModel('User');
    var _ = require('lodash');
    var q = require('q');
    var waterfall = require('promise-waterfall');

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

        return user.save(function(err, createdUser) {
            if (!err) {
                callback(null, createdUser);
            } else {
                callback(err);
            }
        });
    }

    /**
     * Delete a user
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function deleteUser(id /*, callback*/ ) {
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
                if (userData.delAppId) {
                    var index = user.applications.indexOf(userData.addAppId);
                    if (index > -1) {
                        user.applications.splice(userData.delAppId, 1);
                    }
                }
                if (userData.addAppId) {
                    user.applications.push(userData.addAppId);
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

    /**
     * Send a recovery email
     * @param   {String} email User email
     * @returns {Object} Promise
     */
    function sendRecovery(email /*callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return waterfall([
            function() {
                return findUserByEmail(email);
            },
            function(user) {
                return user.generateEmailToken();
            },
            function(token) {
                console.log('Sending token', token, 'to', email);
                if (server.config['mail-sender'].disabled) {
                    return;
                } else {
                    var link = server.apiHost + '/verify?email=' + encodeURIComponent(email) + "&token=" + encodeURIComponent(token);
                    return server.helpers.mailjet({
                        from: server.config['mail-sender'].mailjet.sender,
                        to: [email],
                        subject: server.config['mail-sender'].mailjet.subject,
                        html: '<h1>Change your password</h1><a href="' + link + '">' + link + '</a>'
                    });
                }
            }
        ]).then(
            function() {
                callback(null, email);
                return email;
            },
            function(err) {
                callback(err);
                return err;
            }
        );
    }


    return {
        readUsers: readUsers,
        createUser: createUser,
        deleteUser: deleteUser,
        updateUser: updateUser,
        readUserById: readUserById,
        checkUser: checkUser,
        findUserByEmail: findUserByEmail,
        sendRecovery: sendRecovery
    };
};
