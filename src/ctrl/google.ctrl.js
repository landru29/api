module.exports = function(server) {
    'use strict';

    var url = require('url');

    var passport = server.middlewares.passport;
    var getLoginRedirection = require('./get-login-redirection.js')(server);

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    server.app.get(
        '/auth/google',
        getLoginRedirection,
        passport.authenticate(
            'google',
            {
                scope : ['profile', 'email']
            }
        )
    );

    // the callback after google has authenticated the user
    server.app.get(
        '/auth/google/callback',
        passport.authenticate(
            'google', {
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
