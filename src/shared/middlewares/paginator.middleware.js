module.exports = function (server) {
    'use strict';

    return function (req, res, next) {
        req.pagination = {};
        req.pagination.perPage = req.query.perPage ? req.query.perPage : server.config.application.pagination.perPage;
        req.pagination.page = req.query.page ? req.query.page : 1;
        req.pagination.mongo = {
            limit: req.pagination.perPage,
            skip:  (req.pagination.page -1) * req.pagination.limit
        };
        next();
    };
};
