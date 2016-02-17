module.exports = function (server) {
    'use strict';
    var url = require('url');

    return function (req, res, next) {
        server.console.log('Cors middleware in action');
        var referer = req.headers.referer || req.headers.origin;
        if (referer) {
            var refererUrl = url.parse(referer);
            var allowedOrigin = refererUrl.protocol + '//' + refererUrl.hostname +
                (refererUrl.port ? ':' + refererUrl.port : '');
            server.console.log('allowingCrossDomain on ' + allowedOrigin);
            res.header('Access-Control-Allow-Origin', allowedOrigin);
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers',
                ([
                    'X-Requested-With',
                    'Accept, Origin',
                    'Referer, User-Agent',
                    'Content-Type',
                    'Authorization',
                    'X-Mindflash-SessionID',
                    'access-token',
                    'refresh-token',
                    'client-application'
                ]).join(', '));

            // intercept OPTIONS method
            if ('OPTIONS' === req.method) {
                res.status(200).send();
            } else {
                next();
            }
        } else {
            next();
        }
    };
};
