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

    QuizzSchema.set('toJSON', {
        transform: function(doc, ret) {
            ret.scoringTotal = ret.choices.reduce(function(total, elt){
                return total + (elt.scoring ? elt.scoring : 0);
            }, 0);
        }
    });

    return {
        schema: QuizzSchema
    };
};
