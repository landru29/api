module.exports = function(server) {
    'use strict';

    var url = require('url');

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated()) {
            return next();
        }

        // if they aren't redirect them to the home page
        res.redirect('/');
    }

    function getLoginRedirection(req, res, next) {
        req.session.redirection = server.config.doc.redirection;
        var appCtrl = server.controllers.application;
        if (req.body.appId) {
            appCtrl.readApplicationById(req.body.appId, function(err, data) {
                if ((!err) && (data)) {
                    server.console.log("Application found", data.name);
                    req.session.redirection = data.redirection;
                }
                return next();
            });
        } else {
            return next();
        }
    }

    var passport = server.middlewares.passport;


    // =====================================
    // API MAIN ENTRY ======================
    // =====================================
    /**
     * @followRoute ./api/api.route.js
     * @name        api
     */
    server.app.use('/api',
        require('./api/api.route.js')(server)
    );

    // =====================================
    // INDEX PAGE ==========================
    // =====================================
    server.app.get('/', function(req, res) {
        res.render('index.ejs', {
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // =====================================
    // INTERACTIVE DOC =====================
    // =====================================
    server.app.use('/doc', server.middlewares.fileServer(server.rootFolder + '/doc'));

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    server.app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            errorMessage: req.flash('loginErrorMessage'),
            successMessage: req.flash('loginSuccessMessage'),
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // process the login form
    server.app.post(
        '/login',
        getLoginRedirection,
        passport.authenticate('local-login', {
            failureRedirect : '/login',
            failureFlash : true // allow flash messages
        }),
        function(req, res) {
            var redirect = url.parse(req.session.redirection);
            redirect.query = redirect.query ? redirect.query : {};
            redirect.query.accessToken = req.user.generateAccessToken();
            server.console.log("redirecting to", url.format(redirect));
            res.redirect(url.format(redirect));
        }
    );

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    server.app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {
            message: req.flash('signupErrorMessage'),
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // process the signup form
    server.app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/signup-done',
        failureRedirect : '/signup',
        failureFlash : true // allow flash messages
    }));

    // End of signup
    server.app.get('/signup-done', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup-done.ejs', {
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });


    // =====================================
    // CHANGE PASSWORD =====================
    // =====================================

    // request new password
    server.app.get('/verify', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('verify.ejs', {
            message: req.flash('verifyErrorMessage'),
            appId: req.query.appId ? req.query.appId : "doc",
            email: req.query.email,
            token: req.query.token
        });
    });

    // Change password
    server.app.post('/verify', passport.authenticate('change-password', {
        successRedirect : '/login',
        failureRedirect : '/verify',
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    server.app.get('/auth/facebook',
        getLoginRedirection,
        passport.authenticate('facebook', {
            scope : [
                'email'
            ]
        })
    );

    // handle the callback after facebook has authenticated the user
    server.app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect : '/'
        }),
        function(req, res) {
            var redirect = url.parse(req.session.redirection);
            redirect.query = redirect.query ? redirect.query : {};
            redirect.query.accessToken = req.user.generateAccessToken();
            server.console.log("redirecting to", url.format(redirect));
            res.redirect(url.format(redirect));
        }
    );

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    server.app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user,
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    server.app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
