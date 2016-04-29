'use strict';

var scheduleCtrl = angular.module('scheduleCtrl', ['illuminati-conf']);

scheduleCtrl.controller('scheduleCtrl', ['$scope', '$http', 'config', 'Color', function($scope, $http, config, Color) {

  $http.get(config.apiUrl + '/schedules')
    .success(function(data) {
      $scope.schedules = data;
    })
    .error(function(data, status) {
    });
  $scope.gamut = {
    'r' : {'x' : 0.675, 'y' : 0.322},
    'g' : {'x' : 0.409, 'y' : 0.518},
    'b' : {'x' : 0.167, 'y' : 0.04}
  };
  $scope.wideGamut = {
    'r' : {'x' : 0.700607, 'y' : 0.299301},
    'g' : {'x' : 0.172416, 'y' : 0.746797},
    'b' : {'x' : 0.135503, 'y' : 0.039879}
  };
  $scope.isValidCronField = function(cronField) {
      if (typeof cronField === 'undefined') {
        return false;
      }
      return /^[0-9\/\*,-]+$/.test(cronField);
  };
  $scope.isValidCron = function(cron, cronTestFunc) {
    var cronFields = ['minute', 'hour', 'day', 'month', 'weekday'];

    // Check each cron value using cronTestFunc function.
    for (var i=0; i < cronFields.length; i++) {
      if (!cronTestFunc(cron[cronFields[i]])) {
         throw new Error('Invalid cron spec ' + JSON.stringify(cron));
      }
    }
    return true;
  }
  $scope.isCronAdvanced = function(cron) {

    $scope.isValidCron(cron, $scope.isValidCronField);

    // Day and month fields should be '*' for simple cron.
    if (cron.day != '*' || cron.month != '*') {
      return true;
    }

    // Min and hour should be numeric for simple cron.
    var numPattern = /^[0-9][0-9]?$/;
    if (!numPattern.test(cron.minute) || !numPattern.test(cron.hour)) {
      return true;
    };

    // Weekday field should be '*' or look like 1,6,7 for simple cron.
    var weekPattern = /^(\*|[0-7](,[0-7])*)$/;
    if (!weekPattern.test(cron.weekday)) {
      return true;
    }

    return false;
  };
  $scope.getSchedColor = function(schedule) {
    var color = '#FFFFFF';
    var xy = schedule['xy'];
    if (typeof xy == 'object') {
      var xy = Color.xyPoint(xy['x'], xy['y']);
      if (!Color.pointInGamut(xy, $scope.gamut)) {
        xy = Color.closestPointInGamut(xy, $scope.gamut);
      }
      // Make sure point is within Phillips "wide gamut" as well.
      if (!Color.pointInGamut(xy, $scope.wideGamut)) {
        xy = Color.closestPointInGamut(xy, $scope.wideGamut);
      }
      var rgb = Color.xyToRgb(xy, $scope.gamut);
      color = Color.rgbToHex(rgb.r, rgb.g, rgb.b);
    } else if (typeof xy != 'undefined') {
      throw new Error('XY has incorrect type: "' + typeof xy + '"');
    }
    return {'background-color' : color};
  };
}]);
