module.exports = function(server) {
    'use strict';

    var url = require('url');

    var getLoginRedirection = require('./get-login-redirection.js')(server);

    var passport = server.middlewares.passport;


    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    server.app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {
            errorMessage: req.flash('loginErrorMessage'),
            successMessage: req.flash('loginSuccessMessage'),
            appId: req.query.appId ? req.query.appId : 'doc'
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
            server.console.log('redirecting to', url.format(redirect));
            res.redirect(url.format(redirect));
        }
    );
};
