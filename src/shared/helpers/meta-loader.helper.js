module.exports = function (server) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var docblockParser = require('docblock-parser');
    var _ = require('lodash');

    var endpoints = {};

    var parserOptions = {
        tags: {
            followRoute: docblockParser.singleParameterTag,
            name: docblockParser.singleParameterTag,
            method: docblockParser.singleParameterTag,
            role: docblockParser.multilineTilTag,
            param: docblockParser.multilineTilTag,
            public: docblockParser.booleanTag
        }
    };

    /**
     * Format metadata
     * @param   {String} docBlock Docblock
     * @returns {Object} metadata
     */
    var getParsedTags = function (docBlock) {
        var result = {};
        var meta = docblockParser(parserOptions).parse(docBlock);
        var getMeta = function (str) {
            if (('string' === typeof str) && (str.trim().length)) {
                return str.trim();
            }
            if (_.isArray(str)) {
                var collection = [];
                for (var i = 0; i < str.length; i++) {
                    collection.push(str[i].trim());
                }
                if (collection.length) {
                    return collection;
                }
            }
            if ('boolean' === typeof str) {
                return str;
            }
        };
        if (getMeta(meta.text)) {
            result.description = getMeta(meta.text);
        }
        for (var key in meta.tags) {
            if ((meta.tags.hasOwnProperty(key)) && (getMeta(meta.tags[key]))) {
                result[key] = getMeta(meta.tags[key]);
            }
        }
        return result;
    };

    /**
     * Parse parameter descriptons
     * @param   {String|Array} params Parameter descriptors
     * @returns {Object} Structured descriptor
     */
    var parseParam = function (params) {
        return (_.isArray(params) ? params : [params]).map(function (param) {
            var matcher = param.match(/^\{(\w*)\}\s*(\w*)\s*((?:@(?:\w*)\s*)*)(.*)$/);

            var type = matcher[1];
            var name = matcher[2];
            var tags = matcher[3];
            var description = matcher[4];

            var other = [];
            var result = {
                type: type,
                description: description
            };

            tags.split('@').forEach(function(str) {
                switch (str.trim()) {
                    case '':
                        break;
                    case 'required':
                        result.required = true;
                        break;
                    case 'body':
                        result.where = 'body';
                        break;
                    case 'url':
                    case 'uri':
                        result.where = 'url';
                        break;
                    case 'herder':
                    case 'headers':
                        result.where = 'header';
                        break;
                    default:
                        other.push(str.trim());
                }
            });
            if (other.length) {
                result.tags = other;
            }
            var desc={};
            desc[name] = result;
            return desc;
        });
    };

    /**
     * Recursive file processing
     * @param {String} baseRoute Base route
     * @param {Object} endpoint  Endpoint descriptors
     * @param {String} filename  File to parse
     */
    var processFile = function (baseRoute, endpoint, filename, flatten) {
        var dataFile = fs.readFileSync(filename);
        var parsedPath = path.parse(filename);
        var absolutePath = parsedPath.dir;
        var docMatcher = dataFile.toString().match(/\/\*{2}([\s\S]+?)\*\//g);
        if (docMatcher) {
            docMatcher.forEach(function (docBlock) {
                var meta = getParsedTags(docBlock);

                if ((meta.name) && (!flatten)) {
                    if (!endpoint[meta.name]) {
                        endpoint[meta.name] = {};
                    }
                }

                // process endpoint
                if ((meta.method) && (meta.name)) {
                    var nodeDescriptor;
                    if (flatten) {
                        if (!endpoint[path.join(baseRoute, meta.name)]) {
                            endpoint[path.join(baseRoute, meta.name)] = {};
                        }
                        endpoint[path.join(baseRoute, meta.name)][meta.method.toLowerCase()] = {};
                        nodeDescriptor = endpoint[path.join(baseRoute, meta.name)][meta.method.toLowerCase()];
                    } else {
                        endpoint[meta.name]['@' + meta.method.toUpperCase()] = {};
                        nodeDescriptor = endpoint[meta.name]['@' + meta.method.toUpperCase()];
                    }

                    server.console.log('   *', 'META', path.join(baseRoute, meta.name));

                    nodeDescriptor.acl = {};
                    if (meta.role) {
                        nodeDescriptor.acl.role = (_.isArray(meta.role) ? meta.role : [meta.role])
                            .map(function (val) {
                                if ((/^[\-\*\+\/#]$/).test(val)) {
                                    return '*';
                                } else {
                                    return val;
                                }
                            });
                        if (meta.public) {
                            nodeDescriptor.acl.authenticated = false;
                        }
                    }
                    if (meta.param) {
                        nodeDescriptor.parameters = {};
                        parseParam(meta.param).forEach(function(val) {
                            _.extend(nodeDescriptor.parameters, val);
                        });
                    }
                    nodeDescriptor.description = meta.description;
                }

                // follow file
                if ((meta.followRoute) && (meta.name)) {
                    processFile(
                        path.join(baseRoute, meta.name),
                        flatten ? endpoint : endpoint[meta.name],
                        path.join(absolutePath, meta.followRoute),
                        flatten
                    );
                }
                if ((meta.followRoute) && (!meta.name)) {
                    processFile(
                        baseRoute,
                        endpoint,
                        path.join(absolutePath, meta.followRoute),
                        flatten
                    );
                }
            });
        }
    };

    return function() {
        if (server.metaScanFile) {
            processFile('', endpoints, server.metaScanFile, true);
        } else {
            server.console.warn('No file to scan for metadata');
        }
        return endpoints;
    };


};
