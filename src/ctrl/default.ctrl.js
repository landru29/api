module.exports = function(server) {
    'use strict';

    // =====================================
    // INDEX PAGE ==========================
    // =====================================
    server.app.get('/', function(req, res) {
        res.render('index.ejs', {
            appId: req.query.appId ? req.query.appId : 'doc'
        });
    });
};
