'use strict';

var illuminati = angular.module('illuminati', [
    'scheduleCtrl',
    'liveCtrl',
    'illuminatiServices',
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
        .state('live', {
            url: '/live',
            templateUrl: 'partials/live.html',
            controller: 'liveCtrl'
        });
  }
]);
