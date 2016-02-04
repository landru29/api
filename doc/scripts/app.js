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
])

.config(function($urlRouterProvider, $locationProvider, $httpProvider) {
        'use strict';
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    }
)

.config(function(appConfiguration, NoopyProvider) {
        'use strict';
        NoopyProvider.setBaseUrl(appConfiguration.apiUrl);
    }
)

;
