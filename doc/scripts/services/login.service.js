angular.module('Documentation').service('Login', function ($http, $q, OAuth) {


    var logout = function(){
        OAuth.setToken(null);
    };

    return {
        logout: logout,
        isLoggedIn: function() {
            return !!OAuth.getToken();
        }
    };
});
