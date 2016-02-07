module.exports = function(server) {
    'use strict';

    var User = server.getModel('User');
    var _ = require('lodash');
    var q = require('q');
    var generatePassword = require('password-generator');

    /**
    * Get user by facebook ID and chack duplicates
    * @param   {Object} facbookProfile Facebook profile
    * @returns {Object} Promise
    */
    function getFacebookUser(facebookProfile) {
        server.console.log('Getting facebook user');
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject){
            var email = _.first(facebookProfile.emails);
            if ((email) && (email.value)) {
                q.all([
                    User.findOne({ 'email' : email.value }),
                    User.findOne({ 'facebook.id' : facebookProfile.id })
                ]).then(function(users) {
                    server.console.log('Performing checks');
                    if ((users[0]) && (users[1])) {
                        server.console.log('Two entries found');
                        if (users[0].id === users[1].id) {
                            server.console.log('Entries are equal');
                            resolve(users[0]);
                            return callback(null, users[0]);
                        } else {
                            server.console.log('Removing duplicate', users[0].id, users[1].id);
                            User.remove({
                                _id: users[1]._id
                            }).then(function(){
                                resolve(users[0]);
                                return callback(null, users[0]);
                            }, function(err) {
                                reject(err);
                                return callback(err);
                            });
                        }
                    }
                    // No facebook
                    if ((users[0]) && (!users[1])) {
                        server.console.log('No facebook');
                        resolve(users[0]);
                        return callback(null, users[0]);
                    }
                    // No email
                    if ((!users[0]) && (users[1])) {
                        server.console.log('No email');
                        users[1].email = email.value;
                        users[1].password = generatePassword(20, false);
                        resolve(users[1]);
                        return callback(null, users[1]);
                    }
                    // Unknown user
                    if ((!users[0]) && (!users[1])) {
                        server.console.log('No user');
                        resolve(null);
                        return callback(null, null);
                    }
                }, function(err) {
                    reject(err);
                    return callback(err);
                });
            } else {
                reject('No email found');
                return callback('No email found');
            }
        });
    }

    /**
    * Check for facebook user and register him
    * @param   {Object} facbookProfile Facebook profile
    * @param   {String} facebookToken  Facebook token
    * @returns {Object} Promise
    */
    function checkFacebookUser(facebookProfile, facebookToken) {
        server.console.log('Checking facebook user');
        var callback = server.helpers.getCallback(arguments);
        return q.promise(function(resolve, reject){
            getFacebookUser(facebookProfile).then(function(user) {
                server.console.log('configuring', user);
                if (!user) {
                    user = new User();
                    user.password = generatePassword(20, false);
                }
                user.facebook.id    = facebookProfile.id;
                user.facebook.token = facebookToken;
                user.email = facebookProfile.emails[0].value;
                user.verified = true;

                server.console.log('saving');
                user.save(function(err, savedUser) {
                    if (err) {
                        server.console.error('not saved');
                        reject(err);
                        return callback(err);
                    }
                    server.console.log('saved');
                    resolve(savedUser);
                    return callback(null, savedUser);
                });

            }, function(err) {
                reject(err);
                return callback(err);
            });
        });
    }

    return checkFacebookUser;

};
