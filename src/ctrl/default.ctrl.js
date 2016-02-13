module.exports = function(server) {
    'use strict';

    // =====================================
    // INDEX PAGE ==========================
    // =====================================
    server.app.get('/', function(req, res) {
        console.log("rendeging default");
        res.render('index.ejs', {
            appId: req.query.appId ? req.query.appId : 'doc',
            facebookEn: server.config.connect.facebookAuth.enabled,
            googleEn: server.config.connect.googleAuth.enabled,
            twitterEn: server.config.connect.twitterAuth.enabled,
            localSignupEn: server.config.connect.localSignup.enabled,
            localConnectEn: server.config.connect.localConnect.enabled,
        });
    });
};
