module.exports = function(server) {
    'use strict';

    // =====================================
    // LOGOUT ==============================
    // =====================================
    server.app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
