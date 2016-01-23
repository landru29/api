module.exports = function (/*server*/) {
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
            res.json(response);
        }
    };
};
