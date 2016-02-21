module.exports = function (server) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;
    var q            = require('q');

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
            default: 'New Question'
        },
        choices: {
            type: Array
        }
    });

    function computeScoring(question) {
        return question.scoringTotal = question.choices.reduce(function(total, elt){
            return total + (elt && elt.scoring ? elt.scoring : 0);
        }, 0);
    }

    QuizzSchema.set('toJSON', {
        transform: function(doc, ret) {
            computeScoring(ret);
        }
    });

    QuizzSchema.statics.random = function(filter, count /*, callback*/) {
        var callback = server.helpers.getCallback(arguments);
        var self = this;
        var getRandomArray = function(size) {
            var indexes = [];
            Array.apply(null, { length: count < size-10 ? count: 1 }).forEach(function(){
                var index = -1;
                while ((index<0) || (indexes.indexOf(index)>-1)) {
                    index = Math.floor(Math.random() * size);
                }
                indexes.push(index);
            });
            return indexes;
        };

        return self.count(filter).then(function(size) {
            var tasks = getRandomArray(size).map(function(index){
                return self.findOne(filter, undefined, {skip:index});
            });
            return q.all(tasks);

        }).then(function(data) {
            data.forEach(function(question){
                computeScoring(question);
            });
            callback(null, data);
            return data;
        }, function(err) {
            callback(err);
            return err;
        });
    };

    return {
        schema: QuizzSchema
    };
};
