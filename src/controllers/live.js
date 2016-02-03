'use strict';

var scheduleCtrl = angular.module('liveCtrl', [
   'illuminati-conf'
]);

scheduleCtrl.controller('liveCtrl', ['$scope', '$http', 'config', function($scope, $http, config) {
    $scope.submit = function(x, y, bri, on, trans) {
        var data = {'x' : x, 'y' : y, 'bri' : bri, 'on' : on, 'trans' : trans};
        $http.put(config.apiUrl + '/lights/all', data)
            .success(function() {
                console.log('success?');
            })
            .error(function(data, status) {
                console.log('things did not go so well... ' + data + ' ' + status);
            });
    }
    $scope.x = 0;
    $scope.y = 0;
    $scope.bri = 255;
    $scope.on = 1;
    $scope.trans = 0;
}]);
