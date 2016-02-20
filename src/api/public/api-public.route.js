module.exports = function (server) {
    'use strict';
    var express = require('express');
    var router = express.Router();


    /**
     * @followRoute ./quizz/api-public-quizz.route.js
     * @name        quizz
     */
    router.use('/quizz', require('./quizz/api-public-quizz.route.js')(server));


    return router;
};
