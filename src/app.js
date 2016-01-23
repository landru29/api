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
    this.config = require(process.env.NODE_ENV === 'production' ? '../config.json' : '../config.dev.json');
    this.helpers = {};
    this.mongoose = {
        plugins: [],
        schemas: {},
        instance: null
    };
    this.packageJson = packageJson;
    this.rootFolder = __dirname;
    this.middlewares = {};
    this.controllers = {};
    this.meta = {
        routes: {}
    };
    this.getModel = function (modelName) {
        return this.mongoose.instance.model(modelName);
    };
    if (!this.options) {
        this.options = {};
    }
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
        this.config.application.database.host + ':' +
        this.config.application.database.port + '/' +
        this.config.application.database.name;
    this.mongoose.instance = mongoose.connect(this.options.mongooseConnectionChain ? this.options.mongooseConnectionChain : mongooseConnectionChain, callback);
};


App.prototype.reloadModels = function () {
    for (var model in this.mongoose.instance.model) {
        if (this.mongoose.instance.model.hasOwnProperty(model)) {
            delete this.mongoose.instance.model[model];
        }
    }
    for (var name in this.mongoose.schemas) {
        if (this.mongoose.schemas.hasOwnProperty(name)) {
            this.mongoose.instance.model(name, this.mongoose.schemas[name].schema);
        }
    }
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
