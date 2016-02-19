module.exports = function (/*server*/) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;

    var QuizzSchema   = new Schema({
        explaination: {
            type: String
        },
        image: {
            type: String
        },
        level: {
            type: Number
        },
        published: {
            type: Boolean
        },
        tags: {
            type: String
        },
        text: {
            type: String,
            default: "New Question"
        },
        choices: {
            type: Array
        }
    });

    return {
        schema: QuizzSchema
    };
};
