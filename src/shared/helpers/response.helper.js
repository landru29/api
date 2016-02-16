module.exports = function (server) {
    'use strict';
    return function (req, res, err, data, decorator) {
        if (err) {
            var result = {
                status: 'error',
                message: decorator && decorator.message && decorator.message.err ? decorator.message.err : 'An error occured (' + err.toString() + ')'
            };
            res.status(403).json(result);
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
            if (decorator && decorator.pagination  && decorator.pagination.limit) {
                response.page = 1 + decorator.pagination.skip / decorator.pagination.limit;
                response.perPage = decorator.pagination.limit;
                response.count = decorator.pagination.count;
            }
            res.header('Cache-Control', 'no-cache');
            res.json(response);
        }
    };
};
