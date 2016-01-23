module.exports = function (/*server*/) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;

    var TournamentSchema   = new Schema({
        name: {
            type: String,
            required: 'Name is required',
            unique: false
        },
        sport: {
            type: String,
            default: 'Roller derby'
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        userId: {
            type: String,
            required: true
        }
    });

    var processRelations = function() {};

    return {
        schema: TournamentSchema,
        postLoad: processRelations
    };
};
