angular.module('Documentation', [
    'ui.router',
    'ngStorage',
    'ngResource',
    'ui.bootstrap',
    'ngAnimate',
    'flash',
    'doc.config',
    'ngStorage',
    'api-plugin'
]);

angular.module('Documentation').config(function($urlRouterProvider, $locationProvider, $httpProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    });
