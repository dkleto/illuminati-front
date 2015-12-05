'use strict';

var illuminati = angular.module('illuminati', ['illuminati-conf']);

illuminati.controller('scheduleCtrl', ['$scope', '$http', function($scope, $http, apiUrl) {
    $scope.test = apiUrl;
}]);
