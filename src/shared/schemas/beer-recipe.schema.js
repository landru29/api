module.exports = function (/*server*/) {
    'use strict';

    var mongoose     = require('mongoose');
    var Schema       = mongoose.Schema;

    var RecipeSchema   = new Schema({
        name: {
            type: String,
            required: 'Name is required',
            unique: false
        },
        steps: {
          type: Array,
          //required: false,//"steps are required",
          default: []
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
        schema: RecipeSchema,
        postLoad: processRelations
    };
};
