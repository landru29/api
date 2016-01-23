module.exports = function (server) {
    'use strict';

    var _ = require('lodash');

    function ignoreAcl(toIgnore, url) {
        var ignoreResult = false;
        toIgnore.forEach(function(ignore) {
            if ((new RegExp(ignore)).test(url)) {
                console.log('  *', 'ACL are ignored on route', url, 'due to regExp', ignore);
                ignoreResult = true;
            }
        });
        return ignoreResult;
    }

    function checkAcl(user, AllowedRoles) {
      return ((!!user) && (!!user.role) && (AllowedRoles.indexOf(user.role)>-1));
    }

    return function (req, res, next) {
        console.log('Acl middleware in action');
        if (ignoreAcl(server.config.acl.ignore, req.url)) {
            return next();
        }
        var routeDesc = server.helpers.getRouteDescriptor(req);
        if (routeDesc) {
            console.log('  *', 'Route', routeDesc.route, 'URL', routeDesc.url);
        } else {
            console.log('  *', 'No ACL on', req.method.toUpperCase(), req.originalUrl);
            return res.status(403).send({message: 'No ACL'});
        }
        var acl = routeDesc.descriptor.acl;
        if (acl) {
            acl.role = _.isArray(acl.role) ? acl.role : [acl.role];
            acl.authenticated = ('undefined' === typeof acl.authenticated) ? true : acl.authenticated;
            if (checkAcl(req.user, acl.role)) {
                console.log('  *', 'Allow', req.user.role, 'in', acl.role);
                return next();
            } else {
                console.log('  *', 'Forbiden', acl.role);
                return res.status(403).send({message: 'Forbiden'});
            }
            req.acl = acl;
        } else {
            return res.status(403).send({message: 'Bad ACL'});
        }
    };
};
