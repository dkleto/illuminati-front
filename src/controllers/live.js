'use strict';

var scheduleCtrl = angular.module('liveCtrl', ['illuminati-conf', 'rzModule']);

scheduleCtrl.controller('liveCtrl', ['$scope', '$http', 'config', 'Color', '$window', function($scope, $http, config, Color, $window) {
  // Prevent images (e.g. color triangle) from being draggable.
  $window.ondragstart = function() {return false;};
  $scope.submit = function(param, value) {
    var data = {};
    data[param] = value; //TODO: Add error handling for invalid params.
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
  $scope.briSlider = {
    value : 255,
    options : {
      floor : 0,
      ceil : 255,
      vertical : true,
      onEnd : function(sliderId, modelValue, highValue) {
        $scope.submit('bri', modelValue);
      },
      hidePointerLabels : true,
      hideLimitLabels : true
    }
  }
  $scope.on = true;
  $scope.getXy = function(event) {
    var position = event.target.getBoundingClientRect();
    var x = event.clientX - position.left;
    var y = event.clientY - position.top;
    var height = position.height;
    var width = position.width;
    var isNum = function(i) {
      return typeof i === 'number' ? true : false;
    };
    var inRange = function(i, min, max) {
      return isNum(i) && i >= min && i <= max ? true : false;
    };

    // Height, width should be non-zero and positive.
    if (!isNum(height) || !isNum(width) || height <= 0 || width <= 0) {
      throw new Error('Invalid height and width values - ' +
                      'height: ' + height + 'width: ' + width);
    }

    // x, y should be between 0 and the width and height values respectively.
    if (!inRange(x, 0, width) || !inRange(y, 0, height)) {
      throw new Error('Invalid x and y coordinates - x: ' + x + ' y: ' + y);
    }

    $scope.x = x / width;
    $scope.y = 1 - y / height;
    return Color.xyPoint($scope.x, $scope.y);
  };
}]);
