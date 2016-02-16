module.exports = function (server) {
    'use strict';

    var pathToRegexp = require('path-to-regexp');

    return function(request) {
        var routes = server.meta.routes;
        for (var route in routes) {
            if (routes.hasOwnProperty(route)) {
                var thisRouteMeta = routes[route];
                var regularExpression = pathToRegexp(route[0] !=='/' ? '/' + route : route);
                if ((regularExpression.test(request.originalUrl.replace(/\?.*/, ''))) && (thisRouteMeta[request.method.toLowerCase()])) {
                    return {
                        params : regularExpression.exec(request.url.replace(/\?.*/, '')),
                        descriptor: thisRouteMeta[request.method.toLowerCase()],
                        route: route,
                        url: request.url
                    };
                }
            }
        }
        return false;
    };

};
