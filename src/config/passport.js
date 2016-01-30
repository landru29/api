// config/passport.js

// expose this function to our app using module.exports
module.exports = function(application) {
  'use strict';

  // load all the things we need
  var LocalStrategy = require('passport-local').Strategy;
  var BearerStrategy = require('passport-http-bearer').Strategy;

  var passport = application.middlewares.passport;
  var User = application.getModel('User');

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

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
                return done(null, false, req.flash('signupMessage', 'Cannot signup with email ' + email));
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
                  return done(null, false, req.flash('signupMessage', 'Cannot change password on ' + email + ': ' + err));
              } else {
                  return done(null, user);
              }
            });
        });

      }));

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
