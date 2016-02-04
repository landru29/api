angular.module('Documentation').service('ConfLoader', function ($resource, $q, appConfiguration) {
    return function() {
        var getMainRoute = function(route) {
            var matcher = route.match(/^(\/\w*).*/);
            if (matcher) {
                return  matcher[1];
            }
        };
        return $q(function(resolve, reject) {
            $resource('noopy-api/').get().$promise.then(
                function (data) {
                    var result = {};
                    Object.keys(data.routes).forEach(function(route){
                        var cleanRoute = route.replace(/^\/?api/, '');
                        var mainRoute = getMainRoute(cleanRoute);
                        if (!result[mainRoute]) {
                            result[mainRoute] = {
                                data: {}
                            };
                        }
                        result[mainRoute].data[cleanRoute] = data.routes[route];
                    });
                    resolve(result);
                }, reject
            );
        });
    };
});
