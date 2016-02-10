module.exports = function(server) {
    'use strict';

    var bcrypt = require('bcrypt-nodejs');
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var _ = require('lodash');
    var uuid = require('node-uuid');
    require('mongoose-type-email');

    var validateEmail = function(email) {
        var re = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
        return re.test(email);
    };

    var UserSchema = new Schema({
        name: {
            type: String
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            index: true,
            required: 'Email address is required',
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [/^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        _userLimitation: {
            type: Schema.Types.Mixed
        },
        password: {
            type: String,
            required: true
        },
        emailToken: {
            type: String
        },
        expireToken: {
            type: Date
        },
        facebook: {
            id: String,
            token: String
        },
        google: {
            id: String,
            token: String,
            email: String,
            name: String
        },
        active: {
            type: Boolean,
            default: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: 'user'
        }
    });

    // methods ======================
    // generating a hash

    // checking if password is valid
    UserSchema.methods.checkUser = function(password) {
        return (bcrypt.compareSync(password, this.password)) && (this.verified);
    };

    // generate an email token
    UserSchema.methods.generateEmailToken = function() {
        server.console.log('Generating email token');
        var uid = uuid.v4();
        this.emailToken = uid;
        var now = new Date();
        now.setDate(now.getDate() + 1);
        this.expireToken= now;
        return uid;
    };

    UserSchema.pre('save', function(next) {
        if (this.isModified('password')) {
            server.console.info('Encoding password');
            this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8), null);
        }
        if ((!this.verified) && (!this.emailToken)) {
            this.emailToken = uuid.v4();
        }
        return next();
    });

    UserSchema.set('toJSON', {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    });

    UserSchema.methods.generateAccessToken = function() {
        return server.helpers.oauth.encrypt({
            date: (new Date()).toISOString(),
            _id: this._id,
            name: this.name,
            role: this.role,
            applications: this.applications
        }, 'access-token');
    };

    UserSchema.methods.getLimitation = function(key) {
        var limitation = _.extend({}, server.config['user-limitation'], this._userLimitation);
        return key ? limitation[key] : limitation;
    };

    UserSchema.methods.generateRefreshToken = function() {
        return server.helpers.oauth.encrypt({
            date: (new Date()).toISOString(),
            _id: this._id,
            name: this.name
        }, 'refresh-token');
    };

    UserSchema.methods.isActive = function() {
        return this.active;
    };

    var processRelations = function() {
    };

    return {
        schema: UserSchema,
        postLoad: processRelations
    };
};
