module.exports = function(application) {
  'use strict';

  var LocalStrategy = require('passport-local').Strategy;

  var passport = application.middlewares.passport;


    // =========================================================================
    // CHANGE PASSWORD =============================================================
    // =========================================================================
    passport.use('change-password', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'token',
        passReqToCallback: true // allows us to pass back the entire request to the callback
      },
      function(req, email, token, done) {
        // asynchronous
        process.nextTick(function() {
            application.console.log(email, token);
            application.controllers.user.changePassword(email, token, req.body.password1, req.body.password, function(err, user) {
                if (err) {
                    application.console.warn("error on password change", err);
                  return done(null, false, req.flash('verifyErrorMessage', 'Cannot change password on ' + email + ': ' + err));
              } else {
                  return done(null, user, req.flash('loginSuccessMessage', 'Password updated'));
              }
            });
        });

      }));
};
