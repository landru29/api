(function() {
'use strict';

var _ = require('lodash');
var packageJson = require('../package.json');
var mongoose = require('mongoose');
var path = require('path');

// PREPARE THE DATA TO LOAD
// =============================================================================
var loader = require('./shared/helpers/load.js');

var App = function (server) {
    _.extend(this, server);
    if (!this.options) {
        this.options = {};
    }

    this.console = require('./shared/helpers/console.js')(this);

    this.apiHost = process.env.API_HOST;

    var configFile = (process.env.NODE_ENV === 'production') || (this.options.production) ?
    '../config.json' :
    '../config.dev.json';

    this.console.info('Loading config file', configFile);
    this.config = require(configFile);

    this.helpers = {};
    this.mongoose = {
        plugins: {},
        schemas: {},
        instance: null
    };
    this.packageJson = packageJson;
    this.rootFolder = path.dirname(__dirname);
    this.middlewares = {};
    this.controllers = {};
    this.connectors = {};
    this.meta = {
        routes: {}
    };
    this.getModel = function (modelName) {
        return this.mongoose.instance.model(modelName);
    };
};

App.prototype.bootstrap = function(ready) {
    var self = this;
    this.connectDb(
        function(mongoErr) {
            self.loadAll(mongoErr, ready);
        }
    );
};


// CONNECT TO DATABASE
// =============================================================================

App.prototype.connectDb = function (callback) {
    var mongooseConnectionChain = 'mongodb://' +
        (this.config.application.database.user ? this.config.application.database.user :'') +
        (this.config.application.database.password ? ':' + this.config.application.database.password : '') +
        (this.config.application.database.user ? '@' : '') +
        (this.config.application.database.host + ':') +
        (this.config.application.database.port + '/') +
        (this.config.application.database.name);
    this.mongoDbConnectionChain = this.options.mongooseConnectionChain ? this.options.mongooseConnectionChain : mongooseConnectionChain;
    this.mongoose.instance = mongoose.connect(this.mongoDbConnectionChain, callback);
};


App.prototype.reloadModels = function () {
    var self = this;
    Object.keys(this.mongoose.instance.model).forEach(function(modelName){
        self.console.info('MODELS:', 'deleting', modelName);
        delete self.mongoose.instance.model[modelName];
    });
    Object.keys(this.mongoose.schemas).forEach(function(modelName) {
            self.console.info('MODELS:', 'creating', modelName);
            self.mongoose.schemas[modelName].schema.eachPath(function(path) {
                self.console.log('  *', path);
            });
        self.mongoose.instance.model(modelName, self.mongoose.schemas[modelName].schema);
    });
};

App.prototype.configureSchemas = function() {
    var self = this;
    Object.keys(this.mongoose.schemas).forEach(function(name) {
        self.helpers.mongoosePlugin(self.mongoose.schemas[name].schema, name);
        if (self.mongoose.schemas[name]) {
            self.mongoose.schemas[name].postLoad();
        }
    });
};

App.prototype.loadAll = function (mongooseErr, ready) {

    var self = this;

    // LOAD HELPERS
    // =============================================================================
    this.helpers.loader = loader;
    loader(__dirname + '/shared/helpers', /\.helper\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        self.console.info('HELPERS:', 'Loading', name);
        self.helpers[name] = require(file.fullPathname)(self);
    });

    // LOAD METADATA
    // =============================================================================
    self.console.info('META:', 'Getting meta from source code');
    this.meta = {
        routes: this.helpers.metaLoader()
    };

    // LOAD CONNECTORS
    // =============================================================================
    loader(__dirname + '/shared/connectors', /\.connector\.js$/, function (file) {
        var rawName = file.filename.replace(/\..*/, '');
        var name = _.camelCase(rawName);
        self.console.info('CONNECTORS:', 'Loading', name);
        self.connectors[name] = require(file.fullPathname)(self, self.config.connectors[rawName] ? self.config.connectors[rawName] : {});
    });

    // LOAD MIDDLEWARES
    // =============================================================================
    loader(__dirname + '/shared/middlewares', /\.middleware\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        self.console.info('MIDDLEWARES:', 'Loading', name);
        self.middlewares[name] = require(file.fullPathname)(self);
    });

    // LOAD MONGOOSE PLUGINS
    // =============================================================================
    loader(__dirname + '/shared/mongoose-plugins', /\.plugin\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        self.console.info('MONGOOSE PLUGIN:', 'Loading', name);
        self.mongoose.plugins[name] = require(file.fullPathname)(self);
    });


    // LOAD MODELS
    // =============================================================================
    loader(__dirname + '/shared/schemas', /\.schema\.js$/, function (file) {
        var name = _.capitalize(_.camelCase(file.filename.replace(/\..*/, '')));
        var schemaDescriptor = require(file.fullPathname)(self);
        self.console.info('MODELS:', 'Loading', name);
        self.mongoose.schemas[name] = schemaDescriptor;
    });

    // CONFIGURE MODELS
    // =============================================================================
    this.configureSchemas();
    this.reloadModels();

    // LOAD CONTROLLERS
    // =============================================================================
    loader(__dirname + '/shared/controllers', /\.controller\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        self.console.info('CONTROLLERS:', 'Loading', name);
        self.controllers[name] = require(file.fullPathname)(self);
    });

    // LOAD CONTROLLERS
    // =============================================================================
    loader(__dirname + '/shared/passport', /\.passport\.js$/, function (file) {
        var name = file.filename.replace(/\..*/, '');
        self.console.info('PASSPORT STRATEGY:', 'Loading', name);
        require(file.fullPathname)(self);
    });



    if (ready) {
        ready(mongooseErr);
    }
};

module.exports =  App;
})();
