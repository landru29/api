module.exports = function(server) {
    'use strict';

    var url = require('url');

    var passport = server.middlewares.passport;
    var getLoginRedirection = require('./get-login-redirection.js')(server);


    // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    server.app.get(
        '/auth/twitter',
        getLoginRedirection,
        passport.authenticate('twitter')
    );

    // handle the callback after twitter has authenticated the user
    server.app.get('/auth/twitter/callback',
        passport.authenticate(
            'twitter',
            {
                failureRedirect : '/'
            }
        ),
        function(req, res) {
            var redirect = url.parse(req.session.redirection);
            redirect.query = redirect.query ? redirect.query : {};
            redirect.query.accessToken = req.user.generateAccessToken();
            server.console.log("redirecting to", url.format(redirect));
            res.redirect(url.format(redirect));
        }
    );
};
