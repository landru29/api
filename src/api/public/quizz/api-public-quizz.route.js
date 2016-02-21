module.exports = function(server) {
    'use strict';
    var express = require('express');
    var router = express.Router();
    var controller = server.controllers.quizz;
    var _ = require('lodash');
    var q = require('q');

    /**
     * Read All quizz
     * @name /
     * @method GET
     */
    router.get('/', function (req, res) {
        q.all([
            controller.readQuizz(req.pagination.mongo),
            controller.countQuizz()
        ]).then(function(data) {
            var pagination = _.extend({count: data[1]}, req.pagination);
            var questions = data[0].map(function(question) {
                return _.pick(
                        question,
                        [
                            'explaination',
                            'image',
                            'level',
                            'published',
                            'tags',
                            'text',
                            'choices',
                            'scoringTotal',
                            'id'
                        ]
                    );
                });
            server.helpers.response(req, res, null, data[0], {pagination: pagination});
        }, function(err) {
            server.helpers.response(req, res, err);
        });
    });

    /**
     * Create a question
     * @name /
     * @method POST
     * @role contributor
     * @role admin
     * @param  {String} text          @body   Question
     * @param  {String} explaination  @body   Explaination of the answer
     * @param  {String} choices       @body   Choices (JSON)
     * @param  {String} level         @body   Difficulty level
     * @param {Boolean} published     @body   Publishing flag
     * @param  {String} tags          @body   Tags
     */
    router.post('/', function (req, res) {
        controller.createQuizz(req.body , function(err, data) {
            var quizz =  (_.isObject(data)) ? {
                text: data.text,
                explaination: data.explaination,
                choices: data.choices,
                level: data.level,
                published: data.published,
                tags: data.tags
            } : data;
            server.helpers.response(req, res, err, quizz);
        });
    });

    return router;
};
