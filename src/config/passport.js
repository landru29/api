// config/passport.js

// expose this function to our app using module.exports
module.exports = function(application) {
  'use strict';

  // load all the things we need
  var LocalStrategy = require('passport-local').Strategy;
  var BearerStrategy = require('passport-http-bearer').Strategy;

  var passport = application.middlewares.passport;
  var User = application.getModel('User');
  var generatePassword = require('password-generator');

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
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log("doing");
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {
          console.log("Processing signup");
          application.controllers.user.findUserByEmail(email, function(err, user) {
              if ((user) || (err !=='User not found')) {
                  console.log("User exists");
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
              } else {
                  console.log("Creating user");
                  application.controllers.user.createUser({
                      email: email,
                      password: generatePassword(20, false)
                  }, function(err, newUser) {
                      if (err) {
                          console.log("error on creation", err);
                        throw err;
                      }
                      var token = newUser.generateEmailToken();
                      var link = 'http://' + req.headers.host + '/verify?email=' + encodeURIComponent(email) + "&token=" + encodeURIComponent(token);
                      console.log(link);
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
              }
          });
      });

    }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form
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
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

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
