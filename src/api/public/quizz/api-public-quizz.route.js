module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.quizz;
    var _ = require('lodash');

    /**
     * Read All quizz
     * @name /
     * @method GET
     * @param {String} count @url Number of questions
     * @param {String} level @url level
     */
    router.get('/', function (req, res) {
        var filter = req.query.level ? {
            level: req.query.level
        }: null;
        controller.pickQuizz(
            req.query.count ? req.query.count : 10,
            filter
        ).then(function(data) {
            var questions = data.map(function(question) {
                return _.pick(
                        question,
                        [
                            'explaination',
                            'image',
                            'level',
                            'tags',
                            'text',
                            'choices',
                            'scoringTotal',
                            'id'
                        ]
                    );
                });
            server.helpers.response(req, res, null, questions);
        }, function(err) {
            server.helpers.response(req, res, err);
        });
    });

    return router;
};
