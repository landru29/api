angular.module('Documentation').controller('HeaderCtrl', function ($scope, $http, $modal, Flash, Login, appConfiguration) {
    'use strict';
    var self = this;

    self.isLoggedIn = Login.isLoggedIn();

    this.loginUrl = appConfiguration.loginUrl;

    this.openLoginDialog = function () {
        $modal.open({
            size: 'sm',
            templateUrl: 'views/login.modal.html',
            controller: function ($scope, $modalInstance, Login) {
                $scope.ok = function () {
                    Login.login($scope.email, $scope.password).then(function(){
                        Flash.create('success', 'Your are connected');
                        self.isLoggedIn = Login.isLoggedIn();
                        $modalInstance.close();
                    }, function(err){
                        console.log(err);
                        Flash.create('danger', err.toString());
                        $modalInstance.close();
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
        });
    };

    this.logout = function() {
        Login.logout();
        self.isLoggedIn = Login.isLoggedIn();
    };

});
