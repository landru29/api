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
        var callback = server.helpers.getCallback(arguments);
        return User.find(callback);
    }

    /**
     * Get a user by ID
     * @param {String} id         User Identifier
     * @param {function} callback Callback function
     * @returns {Object} Promise
     */
    function readUserById(id /*, callback*/ ) {
        var callback = server.helpers.getCallback(arguments);
        return User.findById(id, callback);
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
                var resp = _.extend({
                        'access-token': createdUser.generateAccessToken()
                    },
                    createdUser._doc
                );
                callback(null, resp);
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
        var callback = server.helpers.getCallback(arguments);
        return User.remove({
            _id: id
        }, callback);
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
        return q.promise(function(resolve, reject) {
            User.findById(id, function(err, user) {
                if (err) {
                    return callback(err);
                }
                if (userData.name) {
                    user.name = userData.name;
                }
                if (undefined !== userData.verified) {
                    user.verified = !!userData.verified;
                }
                if (userData.password) {
                    user.password = userData.password;
                }
                if (userData.role) {
                    user.role = userData.role;
                }
                if (userData.delAppId) {
                    var index = user.applications.indexOf(userData.addAppId);
                    if (index > -1) {
                        user.applications.splice(userData.delAppId, 1);
                    }
                }
                if (userData.addAppId) {
                    server.controllers.application.readApplicationById(userData.addAppId).then(
                        function(app) {
                            var index = user.applications.indexOf(app._id);
                            if (index < 0) {
                                user.applications.push(app);
                            }
                            user.save(callback).then(function(data) {
                                resolve(data);
                                callback(null, data);
                            }, function(err) {
                                reject(err);
                                callback(err);
                            });
                        },
                        function(err) {
                            reject(err);
                            callback(err);
                        });
                } else {
                    user.save(callback).then(function(data) {
                        resolve(data);
                        callback(null, data);
                    }, function(err) {
                        reject(err);
                        callback(err);
                    });
                }
            });
        });
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
            User.find({
                email: email
            }, function(err, data) {
                if (data.length !== 1) {
                    reject('Failed to login');
                    return callback('Failed to login');
                } else {
                    if (_.first(data).checkUser(password)) {
                        var thisUser = _.first(data);
                        var resp = {
                            'access-token': thisUser.generateAccessToken()
                        };
                        resolve(resp);
                        callback(null, resp);
                    } else {
                        reject('Failed to login');
                        return callback('Failed to login');
                    }
                }
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
            function(data) {
                if (data.length === 1) {
                    callback(null, data[0]);
                    return data[0];
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
