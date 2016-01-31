// config/passport.js

// expose this function to our app using module.exports
module.exports = function(application) {
  'use strict';

  var BearerStrategy = require('passport-http-bearer').Strategy;

  var passport = application.middlewares.passport;

  // =========================================================================
  // TOKEN LOGIN =============================================================
  // =========================================================================
  passport.use('token-login', new BearerStrategy(
    function(token, done) {
        application.helpers.oauth.decrypt(token, 'access-token', function(err, userData) {
            if (userData) {
                application.controllers.user.readUserById(userData._id, function(err, user){
                    if (err) {
                      return done(err);
                    }
                    if (!user) {
                      return done(null, false);
                    }
                    return done(null, user);
                });
            } else {
                return done(null, {});
            }
        });
    }
  ));

};
