'use strict';

var colourCtrl = angular.module('colourCtrl', ['illuminati-conf']);

colourCtrl.controller('colourCtrl', ['$scope', '$mdDialog', 'bri', 'xy', 'Color', 'config', '$http', function($scope, $mdDialog, bri, xy, Color, config, $http) {
    $scope.bri = bri;
    $scope.minBri = 0;
    $scope.maxBri = 255;
    $scope.xy = xy;
    $scope.getXy = function(event) {
      var position = event.target.getBoundingClientRect();
      var x = event.clientX - position.left;
      var y = event.clientY - position.top;
      var height = position.height;
      var width = position.width;

      return Color.getXy(height, width, x, y);
    };
    $scope.setXy = function(eventObj) {
        $scope.xy = $scope.getXy(eventObj);
    };
    $scope.applyLive = function(result) {
      result.on = true;
      var putConfig = {timeout         : config.timeout,
                       params          : result,
                       paramSerializer : '$httpParamSerializerJQLike'};
      $http.put(config.apiUrl + '/lights/all', '', putConfig);
    };
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.save = function(result) {
      $mdDialog.hide(result);
    };
}]);
