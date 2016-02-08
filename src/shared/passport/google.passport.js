module.exports = function(server) {
  'use strict';

  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  var passport = server.middlewares.passport;

  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  passport.use(new GoogleStrategy({

      clientID        : server.config.connect.googleAuth.clientID,
      clientSecret    : server.config.connect.googleAuth.clientSecret,
      callbackURL     : server.config.connect.googleAuth.callbackURL

  },
  function(token, refreshToken, profile, done) {

      // make the code asynchronous
      // User.findOne won't fire until we have all our data back from Google
      process.nextTick(function() {

          server.controllers.user.checkGoogleUser(profile, token).then(
              function(user) {
                  server.console.log('registering', user);
                  return done(null, user);
              },
              function(err) {
                  return done(err);
              }
          );
      });

  }));
};
