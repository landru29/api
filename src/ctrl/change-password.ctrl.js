module.exports = function(server) {
    'use strict';

    var passport = server.middlewares.passport;


    // =====================================
    // CHANGE PASSWORD =====================
    // =====================================

    // request new password
    server.app.get('/verify', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('verify.ejs', {
            message: req.flash('verifyErrorMessage'),
            appId: req.query.appId ? req.query.appId : 'doc',
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

};
