angular.module('Documentation').service('OAuth', function($localStorage) {
    
    var accessToken = $localStorage.accessToken;
    
    return {
        setToken: function(token) {
            accessToken = token;
            $localStorage.accessToken = token;
        },
        getToken: function() {
            return accessToken;
        }
    };
});