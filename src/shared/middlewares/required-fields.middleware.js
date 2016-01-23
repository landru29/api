module.exports = function (/*server*/) {
    'use strict';

    return function (req, res, next) {
      next();
        /*server.log.info('Required Field middleware in action');
        var routeDesc = server.helpers.getRouteDescriptor(req);
        if ((routeDesc) && (routeDesc.descriptor) && (routeDesc.descriptor.parameters)) {
            var error = false;
            var parameters = routeDesc.descriptor.parameters;
            var keyError;
            var params = routeDesc.params;
            for (var key in parameters) {
                if ((parameters.hasOwnProperty(key)) && (parameters[key].required)) {
                    var thisParameter = parameters[key];
                    switch (thisParameter.where) {
                    case 'body':
                        if (!req.body[key]) {
                            error = true;
                            keyError = key;
                        }
                        break;
                    case 'url':
                        break;
                    case 'header':
                        if (!req.body[key]) {
                            error = true;
                            keyError = key;
                        }
                        break;
                    default:
                    }
                }
            }
            if (!error) {
                next();
            } else {
                res.status(403).json({
                    status: 'error',
                    message: 'Missing parameter: ' + keyError
                });
            }
        } else {
            next();
        }*/
    };
};
