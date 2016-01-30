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

    this.apiHost = process.env.API_HOST;

    this.config = require(
        (process.env.NODE_ENV === 'production') || (this.options.production) ?
        '../config.json' :
        '../config.dev.json'
    );
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

    this.mongoose.instance = mongoose.connect(this.options.mongooseConnectionChain ? this.options.mongooseConnectionChain : mongooseConnectionChain, callback);
};


App.prototype.reloadModels = function () {
    var self = this;
    Object.keys(this.mongoose.instance.model).forEach(function(modelName){
        console.log('MODELS:', 'deleting', modelName);
        delete self.mongoose.instance.model[modelName];
    });
    Object.keys(this.mongoose.schemas).forEach(function(modelName) {
        console.log('MODELS:', 'creating', modelName);
        self.mongoose.schemas[modelName].schema.eachPath(function(path) {
            console.log('  *', path);
        });
        self.mongoose.instance.model(modelName, self.mongoose.schemas[modelName].schema);
    });
};


App.prototype.loadAll = function (mongooseErr, ready) {

    var self = this;

    // LOAD API META
    // =============================================================================

    var loadRoute = function (node, baseRoute, collection) {
        if ('string' !== typeof node) {
            for (var subPath in node) {
                if (node.hasOwnProperty(subPath)) {
                    if (!(/^@/).test(subPath)) {
                        loadRoute(node[subPath], path.join(baseRoute, subPath), collection);
                    } else {
                        var method = subPath.replace(/^@/, '').toLowerCase();
                        console.log('   *', 'META', baseRoute, method.toUpperCase());
                        if (!collection[baseRoute]) {
                            collection[baseRoute] = {};
                        }
                        collection[baseRoute][method] = node[subPath];
                    }
                }
            }
        }
    };

    // LOAD METADATA
    // =============================================================================
    console.log('Getting meta from source code');
    this.meta = {
        routes: require('./meta-loader')(this)
    };

    // LOAD HELPERS
    // =============================================================================
    console.log('HELPERS: Loading load');
    this.helpers.loader = loader;
    loader(__dirname + '/shared/helpers', /\.helper\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        console.log('HELPERS: Loading ' + name);
        self.helpers[name] = require(file.fullPathname)(self);
    });

    // LOAD CONNECTORS
    // =============================================================================
    loader(__dirname + '/shared/connectors', /\.connector\.js$/, function (file) {
        var rawName = file.filename.replace(/\..*/, '');
        var name = _.camelCase(rawName);
        console.log('CONNECTORS: Loading ' + name);
        self.connectors[name] = require(file.fullPathname)(self, self.config.connectors[rawName] ? self.config.connectors[rawName] : {});
    });

    // LOAD MIDDLEWARES
    // =============================================================================
    loader(__dirname + '/shared/middlewares', /\.middleware\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        console.log('MIDDLEWARES: Loading ' + name);
        self.middlewares[name] = require(file.fullPathname)(self);
    });

    // LOAD MONGOOSE PLUGINS
    // =============================================================================
    loader(__dirname + '/shared/mongoose-plugins', /\.plugin\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        console.log('MONGOOSE PLUGIN: Loading ' + name);
        self.mongoose.plugins[name] = require(file.fullPathname)(self);
    });


    // LOAD MODELS
    // =============================================================================
    loader(__dirname + '/shared/schemas', /\.schema\.js$/, function (file) {
        var name = _.capitalize(_.camelCase(file.filename.replace(/\..*/, '')));
        var schemaDescriptor = require(file.fullPathname)(self);
        console.log('MODELS: Loading ' + name);
        self.helpers.mongoosePlugin(schemaDescriptor.schema);
        self.mongoose.schemas[name] = schemaDescriptor;
    });
    for (var name in this.mongoose.schemas) {
        if (this.mongoose.schemas[name].postLoad) {
            this.mongoose.schemas[name].postLoad();
        }
    }

    this.reloadModels();

    // LOAD CONTROLLERS
    // =============================================================================
    loader(__dirname + '/shared/controllers', /\.controller\.js$/, function (file) {
        var name = _.camelCase(file.filename.replace(/\..*/, ''));
        console.log('CONTROLLERS: Loading ' + name);
        self.controllers[name] = require(file.fullPathname)(self);
    });


    if (ready) {
        ready(mongooseErr);
    }
};

module.exports =  App;
})();
