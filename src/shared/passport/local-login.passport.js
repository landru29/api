// config/passport.js

// expose this function to our app using module.exports
module.exports = function(application) {
  'use strict';

  var LocalStrategy = require('passport-local').Strategy;

  var passport = application.middlewares.passport;


  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        application.controllers.user.checkUser(email, password, function(err, user) {
            if (err) {
              return done(err);
          }
            return done(null, user);
        });
    }));


};
