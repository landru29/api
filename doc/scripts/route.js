/*global angular*/
angular.module('Documentation').config(function ($stateProvider) {
    'use strict';
    $stateProvider.state('index', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'Main'
    });
});