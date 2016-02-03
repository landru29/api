module.exports = function(application) {
  'use strict';

  var LocalStrategy = require('passport-local').Strategy;

  var passport = application.middlewares.passport;


  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'appId',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, appId, done) {
      // asynchronous
      process.nextTick(function() {
          application.controllers.user.signup(email, appId, function(err, newUser) {
              if (err) {
                  console.log("error on creation", err);
                return done(null, false, req.flash('signupErrorMessage', 'Cannot signup with email ' + email));
              }

              var link = 'http://' + req.headers.host + '/verify?' +
                'email=' + encodeURIComponent(email) +
                '&appId=' + encodeURIComponent(appId) +
                '&token=' + encodeURIComponent(newUser.emailToken);
              application.connectors.mailjet({
                    to: [email],
                    html: '<h1>Change your password</h1><a href="' + link + '">' + link + '</a>'
              }, function(err) {
                    if (err) {
                        throw err;
                    }
                    return done(null, newUser);
              });
          });
      });

    }));





};
