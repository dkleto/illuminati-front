'use strict';

var scheduleCtrl = angular.module('liveCtrl', ['illuminati-conf']);

scheduleCtrl.controller('liveCtrl', ['$scope', '$http', 'config', 'Color', '$window', function($scope, $http, config, Color, $window) {
  // Prevent images (e.g. color triangle) from being draggable.
  $window.ondragstart = function() {return false;};
  $scope.submit = function(param, value) {
    var data = {};
    data[param] = value; //TODO: Add error handling for invalid params.
    data.transitiontime = $scope.trans;
    console.log(JSON.stringify(data));

    var putConfig = {timeout         : 5000, //TODO: Move this into config.
                     params          : data,
                     paramSerializer : '$httpParamSerializerJQLike'};

    $http.put(config.apiUrl + '/lights/all', '', putConfig)
      .success(function(data) {
        console.log('success: ' + JSON.stringify(data));
      })
      .error(function(data, status) {
        console.log('error: ' + data + ' ' + status);
      });
  };
  $scope.bri = 255;
  $scope.on = true;
  $scope.trans = 0;
}]);
