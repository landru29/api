module.exports = function (/*server*/) {
    'use strict';
    var _ = require('lodash');
    
    return function (req, res, err, data, decorator) {
        if (err) {
            var message = ('string' === typeof(err) ? err : '') +
                          ('string' === typeof(err.status) ? err.status : '');
            var code = err.code ? err.code : 403;
            var result = {
                status: 'error',
                message: decorator && decorator.message && decorator.message.err ? decorator.message.err : 'An error occured (' + message + ')'
            };
            res.status(code).json(result);
        } else {
            var response = {
                status: 'success'
            };
            if (data) {
                response.data = data;
            }
            if (decorator && decorator.message && decorator.message.success) {
                response.message = decorator.message.success;
            }
            if (decorator && decorator.pagination) {
                _.extend(response, _.pick(decorator.pagination, ['page', 'perPage', 'count']));
            }
            res.header('Cache-Control', 'no-cache');
            res.json(response);
        }
    };
};
