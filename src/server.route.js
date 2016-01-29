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
        res.redirection = server.config.doc.redirection;
        var appCtrl = server.controllers.application;
        if (req.body.appId) {
            appCtrl.readApplicationById(req.body.appId, function(err, data) {
                if (!err) {
                    res.redirection = data.redirection;
                }
                next();
            });
        } else {
            next();
        }
    }

    var passport = server.middlewares.passport;


    /**
     * @followRoute ./api/api.route.js
     * @name        api
     */
    server.app.use('/api',
        require('./api/api.route.js')(server)
    );

    // Default page
    server.app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    //Documentation
    server.app.use('/doc', server.middlewares.fileServer(server.rootFolder + '/doc'));

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    server.app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            message: req.flash('loginMessage'),
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // process the login form
    server.app.post(
        '/login',
        getLoginRedirection,
        passport.authenticate('local-login', {
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),
        function(req, res) {
            console.log(res.redirection);
            var redirect = url.parse(res.redirection);
            redirect.query = redirect.query ? redirect.query : {};
            redirect.query.accessToken = req.user.generateAccessToken();
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
            message: req.flash('signupMessage'),
            appId: req.query.appId ? req.query.appId : "doc"
        });
    });

    // process the signup form
    server.app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/signup-done',
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // End of signup
    server.app.get('/signup-done', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup-done.ejs', {
            message: req.flash('signupMessage')
        });
    });

    // process the signup form
    server.app.get('/verify', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('verify.ejs', {
            message: req.flash('signupMessage'),
            appId: req.query.appId ? req.query.appId : "doc",
            email: req.query.email,
            token: req.query.token
        });
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    server.app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
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
