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
     */
    router.get('/', function (req, res) {
        controller.readQuizz(function(err, data) {
            server.helpers.response(req, res, err, data);
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
