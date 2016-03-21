'use strict';

var scheduleCtrl = angular.module('liveCtrl', ['illuminati-conf']);

  $scope.submit = function(x, y, bri, on, trans) {
    var data = {xy    : {x : x, y : y},
                bri   : bri,
                on    : on,
                transitiontime : trans};
scheduleCtrl.controller('liveCtrl', ['$scope', '$http', 'config', 'Color', '$window', function($scope, $http, config, Color, $window) {
  // Prevent images (e.g. color triangle) from being draggable.
  $window.ondragstart = function() {return false;};
    var putConfig = {timeout         : 5000, //TODO: Move this into config.
                     params          : data,
                     paramSerializer : '$httpParamSerializerJQLike'};

    $http.put(config.apiUrl + '/lights/all', '', putConfig)
      .success(function(data) {
        console.log('success: ' + data);
      })
      .error(function(data, status) {
        console.log('error: ' + data + ' ' + status);
      });
  };
  $scope.x = 0;
  $scope.y = 0;
  $scope.bri = 255;
  $scope.on = true;
  $scope.trans = 0;
}]);
