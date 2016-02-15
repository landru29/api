module.exports = function(server) {
    'use strict';

    return function (req, res, next) {
        req.session.redirection = server.config.doc.redirection;
        var appCtrl = server.controllers.application;
        if (req.query.appId) {
            server.console.log('Getting application', req.query.appId);
            appCtrl.readApplicationById(req.query.appId, function(err, data) {
                if ((!err) && (data)) {
                    server.console.log('Application found', data.name);
                    req.session.redirection = data.redirection;
                } else {
                    server.console.log('Application Not found');
                }
                return next();
            });
        } else {
            return next();
        }
    };
};
