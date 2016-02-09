angular.module('Documentation').controller('HeaderCtrl', function ($scope, $http, Flash, Login, Noopy) {
    'use strict';
    var self = this;

    self.isLoggedIn = Login.isLoggedIn();

    this.loginUrl = Noopy.getLoginUrl();

    this.logout = function() {
        Login.logout();
        self.isLoggedIn = Login.isLoggedIn();
    };

});
