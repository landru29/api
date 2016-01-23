angular.module('Documentation', [
    'ui.router',
    'ngStorage',
    'ngResource',
    'ui.bootstrap',
    'ngAnimate',
    'flash',
    'doc.config',
    'ngStorage'
]);

angular.module('Documentation').config(function($urlRouterProvider, $locationProvider, $httpProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('OAuthInterceptor');
    })
.run(function($location, $localStorage) {
    if ($location.search().accessToken) {
        $localStorage.accessToken = $location.search().accessToken;
        $location.search('accessToken', null);
        $location.path($location.absUrl());
    }
});
