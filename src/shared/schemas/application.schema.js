module.exports = function (/*server*/) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;

    var ApplicationSchema   = new Schema({
        name: {
            type: String,
            required: 'Name is required',
            unique: true
        },
        active: {
            type: Boolean,
            default: true
        },
        redirection: {
            type: String
        }
    });

    var processRelations = function() {};

    return {
        schema: ApplicationSchema,
        postLoad: processRelations
    };
};
