module.exports = function(server) {
  'use strict';

  var bcrypt = require('bcrypt-nodejs');
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  require('mongoose-type-email');

  var validateEmail = function(email) {
    var re = /^\w+([\.\-]?\w+)*@\w+([\.\-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };

  var UserSchema = new Schema({
    name: {
      type: String,
      required: false
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
    password: {
      type: String,
      required: true
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    twitter: {
      id: String,
      token: String,
      displayName: String,
      username: String
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
    role: {
      type: String,
      default: 'user'
    }
  });

  // methods ======================
  // generating a hash

  // checking if password is valid
  UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  UserSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password')) {
      return next();
    }
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(8), null);
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
      _id: this._id,
      name: this.name,
      role: this.role,
      applications: this.applications
    }, 'access-token');
  };

  UserSchema.methods.generateRefreshToken = function() {
      return server.helpers.oauth.encrypt({
        _id: user._id,
        name: user.name
      }, 'refresh-token');
  };

  UserSchema.methods.isActive = function() {
    return this.active;
  };

  var processRelations = function() {
    UserSchema.add({
      applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
      }]
    });
  };

  return {
    schema: UserSchema,
    postLoad: processRelations
  };
};
