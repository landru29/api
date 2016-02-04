angular.module('Documentation').controller('MainCtrl', function($scope, ConfLoader, appConfiguration, $http) {
    'use strict';
    var self = this;

    this.boolean = [
        {
            label: ""
        },
        {
            value: true,
            label: "True"
        },
        {
            value: false,
            label: "False"
        }
    ];


    this.init = function() {
        (new ConfLoader()).then(
            function(data) {
                self.endpoints = data;
                console.log(data);
            }
        );
    };

    this.parseParameters = function(parameters) {
         var params = {};
        for (var name in parameters) {
            var where = parameters[name].where;
            if (! params[where]) {
                params[where] = {};
            }
            params[where][name] = parameters[name].value;
        }
        return params;
    };

    this.buildUrl = function(route, params) {
        var thisParams = JSON.parse(JSON.stringify(params ? params : {}));
        var uri = route.replace(/:(\w*)/g, function(replacement, key){
            if ('undefined' !== typeof thisParams[key]) {
                var value = thisParams[key];
                delete thisParams[key];
                return value;
            } else {
                return replacement;
            }
        });
        var rest = [];
        for (var key in thisParams) {
            rest.push(encodeURIComponent(key) + '=' + encodeURIComponent(thisParams[key]));
        }
        uri += rest.length ? '?' + rest.join('&') : '';
        return  uri.replace(/^\/?(api\/)?/, 'noopy-api/');
    };

    this.request = function(route, method, metadata) {
        var params = self.parseParameters(metadata.parameters);
        var req = {
            method: method.toUpperCase(),
            url: self.buildUrl(route, params.url),
            data: params.body,
            headers: params.headers
        };
        metadata.result = {
            error:'',
            success: ''
        };

        $http(req).success(
            function(data){
                metadata.result.success = data;
            }).error(function(err, status){
                metadata.result.error = err;
            });
    };

    this.init();
});
