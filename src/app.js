'use strict';

var illuminati = angular.module('illuminati', [
    'ngRoute',
    'scheduleCtrl',
    'liveCtrl',
    'illuminatiServices'
]);

illuminati.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/schedules', {
        templateUrl: 'partials/schedule-list.html',
        controller: 'scheduleCtrl'
      }).
      when('/live', {
        templateUrl: 'partials/live.html',
        controller: 'liveCtrl'
      }).
      otherwise({
        redirectTo: '/schedules'
      });
  }]);
