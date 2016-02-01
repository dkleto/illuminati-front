'use strict';

var illuminati = angular.module('illuminati', [
    'ngRoute',
    'scheduleCtrl'
]);

illuminati.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/schedules', {
        templateUrl: 'partials/schedule-list.html',
        controller: 'scheduleCtrl'
      }).
      otherwise({
        redirectTo: '/schedules'
      });
  }]);
