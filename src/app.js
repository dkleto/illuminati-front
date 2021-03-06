'use strict';

var illuminati = angular.module('illuminati', [
    'scheduleCtrl',
    'liveCtrl',
    'colourCtrl',
    'illuminatiColorService',
    'illuminatiCronService',
    'ui.router',
    'ngMoment',
    'ngMaterial',
    'ngAnimate',
    'ngAria',
    'ngMessages',
    'mdPickers'
]);

illuminati.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$mdThemingProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider, $mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('grey', {
          'default': '800',
        })
        .accentPalette('red', {
          'default': '300'
        });
    $urlRouterProvider.otherwise("/schedules");
    $stateProvider
        .state('schedules', {
            url: '/schedules',
            templateUrl: 'partials/schedule-list.html',
            controller: 'scheduleCtrl'
        })
            .state('schedules.edit', {
                url: '/edit/{scheduleid:[0-9a-fA-F]{24}}',
                templateUrl: 'partials/schedule-list.html',
                controller: 'scheduleCtrl'
            })
        .state('live', {
            url: '/live',
            templateUrl: 'partials/live.html',
            controller: 'liveCtrl'
        });
   $httpProvider.interceptors.push(function() {
       var logExt = function(response, fullResponse) {
           var url = response.config.url;
           var status = response.status;
           var method = response.config.method;

           // Only log for external requests in dev environment.
           if (config.env !== 'dev' || !/^https?:/.test(url)) {
               return;
           }

           if (status === -1) {
               console.log('No response received for ' + method +
                           ' request ' + 'to ' + url);
           } else {
               console.log(method + ' request to ' + url + ' returned ' +
                           status);
           }

           if (fullResponse) {
               console.log(JSON.stringify(response));
           }
       }
       return {
           'response': function(response) {
               logExt(response, false);
               return response;
           },
           'responseError': function(rejection) {
               logExt(rejection, true);
           }
       };
   });
  }
]);
