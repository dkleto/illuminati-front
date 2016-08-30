'use strict';

var scheduleCtrl = angular.module('scheduleCtrl', ['illuminati-conf']);

scheduleCtrl.controller('scheduleCtrl', ['$scope', '$http', 'config', 'Color', 'Cron', function($scope, $http, config, Color, Cron) {

  $scope.syncList = function() {
    $http.get(config.apiUrl + '/schedules')
      .success(function(data) {
        $scope.schedules = data;
        for (var i=0; i < $scope.schedules.length; i++) {
          var schedule = $scope.schedules[i];
          schedule.timeStamp = Date.parse(schedule.creationtime);
          schedule.weekdays = Cron.getCronWeekdays(schedule.cron);
        }
      });
  };
  $scope.cron = Cron;
  $scope.syncList();
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
