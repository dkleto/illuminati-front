'use strict';

var illuminati = angular.module('illuminati', ['illuminati-conf']);

illuminati.controller('scheduleCtrl', ['$scope', '$http', 'config', function($scope, $http, config) {
    $http.get(config.apiUrl + '/schedules')
        .success(function(data) {
            $scope.schedules = data;
        })
        .error(function(data, status) {
        });
}]);
