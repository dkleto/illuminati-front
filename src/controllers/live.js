'use strict';

var scheduleCtrl = angular.module('liveCtrl', ['illuminati-conf']);

scheduleCtrl.controller('liveCtrl', ['$scope', '$http', 'config', 'Color', '$window', function($scope, $http, config, Color, $window) {
  // Prevent images (e.g. color triangle) from being draggable.
  $window.ondragstart = function() {return false;};
  $scope.submit = function(param, value) {
    var data = {};
    data[param] = value; //TODO: Add error handling for invalid params.

    var putConfig = {timeout         : config.timeout,
                     params          : data,
                     paramSerializer : '$httpParamSerializerJQLike'};

    $http.put(config.apiUrl + '/lights/all', '', putConfig);
  };
  $scope.bri = 255;
  $scope.on = true;
  $scope.getXy = function(event) {
    var position = event.target.getBoundingClientRect();
    var x = event.clientX - position.left;
    var y = event.clientY - position.top;
    var height = position.height;
    var width = position.width;

    return Color.getXy(height, width, x, y);
  };
}]);
