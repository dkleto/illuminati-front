'use strict';

var illuminati = angular.module('illuminati', [
    'scheduleCtrl',
    'liveCtrl',
    'editCtrl',
    'illuminatiColorService',
    'illuminatiCronService',
    'rzModule',
    'ui.router'
]);

illuminati.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
  function($stateProvider, $urlRouterProvider, $httpProvider) {
    $urlRouterProvider.otherwise("/schedules");
    $stateProvider
        .state('schedules', {
            url: '/schedules',
            templateUrl: 'partials/schedule-list.html',
            controller: 'scheduleCtrl'
        })
            .state('schedules.new', {
                url: '/new',
                templateUrl: 'partials/schedule-edit.html',
                controller: 'editCtrl'
            })
            .state('schedules.edit', {
                url: '/edit/{scheduleid:[0-9a-fA-Z]{24}}',
                templateUrl: 'partials/schedule-edit.html',
                controller: 'editCtrl'
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
