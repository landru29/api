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
          default: []
        },
        date: {
            type: Date,
            required: false,
            default: Date.now
        }
    });

    return {
        schema: RecipeSchema
    };
};
