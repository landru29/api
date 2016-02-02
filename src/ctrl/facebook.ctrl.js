module.exports = function(server) {
    'use strict';

    var url = require('url');

    var passport = server.middlewares.passport;
    var getLoginRedirection = require('./get-login-redirection.js')(server);

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

};
