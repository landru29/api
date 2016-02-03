module.exports = function(server) {
  'use strict';

  var FacebookStrategy = require('passport-facebook');

  var passport = server.middlewares.passport;


  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID        : server.config.connect.facebookAuth.clientID,
      clientSecret    : server.config.connect.facebookAuth.clientSecret,
      callbackURL     : server.config.connect.facebookAuth.callbackURL,
      profileFields   : ['id', 'email']

  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

          server.controllers.user.checkFacebookUser(profile, token).then(
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
