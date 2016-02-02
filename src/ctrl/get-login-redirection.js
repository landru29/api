module.exports = function(server) {
    'use strict';

    return function (req, res, next) {
        req.session.redirection = server.config.doc.redirection;
        var appCtrl = server.controllers.application;
        if (req.body.appId) {
            appCtrl.readApplicationById(req.body.appId, function(err, data) {
                if ((!err) && (data)) {
                    server.console.log("Application found", data.name);
                    req.session.redirection = data.redirection;
                }
                return next();
            });
        } else {
            return next();
        }
    };
};
