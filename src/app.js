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

illuminati.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
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
  }
]);
