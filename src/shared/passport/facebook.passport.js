// config/passport.js

// expose this function to our app using module.exports
module.exports = function(application) {
  'use strict';

  var FacebookStrategy = require('passport-facebook');

  var passport = application.middlewares.passport;
  var User = application.getModel('User');


  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  passport.use(new FacebookStrategy({

      // pull in our app id and secret from our auth.js file
      clientID        : application.config.connect.facebookAuth.clientID,
      clientSecret    : application.config.connect.facebookAuth.clientSecret,
      callbackURL     : application.config.connect.facebookAuth.callbackURL,
      profileFields   : ['id', 'email']

  },

  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

          application.controllers.user.checkFacebookUser(profile, token).then(
              function(user) {
                  return done(null, user);
              },
              function(err) {
                  return done(err);
              }
          );
      });

  }));
};
