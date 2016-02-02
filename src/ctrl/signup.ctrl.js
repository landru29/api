module.exports = function(server) {
    'use strict';

    var passport = server.middlewares.passport;

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

};
