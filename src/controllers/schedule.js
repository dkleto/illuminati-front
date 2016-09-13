'use strict';

var scheduleCtrl = angular.module('scheduleCtrl', ['illuminati-conf']);

scheduleCtrl.controller('scheduleCtrl', ['$scope', '$http', 'config', 'Color', 'Cron', '$state', '$stateParams', '$location', function($scope, $http, config, Color, Cron, $state, $stateParams, $location) {

  $scope.editTemplate = 'partials/schedule-edit.html';

  // Set up function to handle type checking and default values.
  $scope.setVal = function(property, defVal, callback) {
    var validProp = typeof property !== 'undefined' && property !== null;
    var validFunc = typeof callback === 'function';

    if (validProp && validFunc) {
      return callback(property);
    }
    return defVal;
  };
  $scope.maxBri = 255;
  $scope.minBri = 0;
  $scope.colors = {}
  $scope.syncList = function() {
    // Pull down all schedules and build an array of schedule objects.
    $http.get(config.apiUrl + '/schedules')
      .success(function(data) {
        $scope.schedules = data;
        for (var i=0; i < $scope.schedules.length; i++) {
          var schedule = $scope.schedules[i];
          schedule.id = schedule['_id']['$oid'];
          // Set timestamp for schedule sorting.
          schedule.timeStamp = Date.parse(schedule.creationtime);
          $scope.colors[schedule.id] = $scope.getSchedColor(schedule);

          var weekDay = {'mon' : true,
                         'tue' : true,
                         'wed' : true,
                         'thu' : true,
                         'fri' : true,
                         'sat' : true,
                         'sun' : true};

          if (Cron.isCronAdvanced(schedule['cron'])) {
            //TODO: Handle advanced cron specs properly.
            console.log('Advanced cron specs not yet supported.');
          } else {
            // Set up models for cron field manipulation.
            schedule.weekday = $scope.setVal(schedule['cron'],
                                    weekDay,
                                    Cron.getCronWeekdays);
            schedule.minute = $scope.setVal(schedule['cron']['minute'],
                                     0,
                                     parseInt);
            schedule.hour = $scope.setVal(schedule['cron']['hour'],
                                   12,
                                   parseInt);
          }
        }
      });
  };
  $scope.toggleEdit = function(schedId) {
    // Check and validate on existing schedules?
    if (typeof schedId === 'string' && schedId.match(/[0-9a-fA-F]{24}/)) {
      var fullPath = '/schedules/edit/' + schedId;
      if (fullPath === $location.path()) {
        // Hide editing mode if schedule is already open for editing.
        $location.path('/schedules');
      } else {
        // Open schedule for editing if it is not already open.
        $location.path(fullPath);
      }
    }
  };
  $scope.isEditEnabled = function(scheduleId) {
    if ($state.is('schedules.edit')) {
      return scheduleId === $location.path().replace(/.*\//, '');
    }
    return false;
  };
  $scope.updateColor = function(schedule, eventObj) {
    schedule['xy'] = $scope.getXy(eventObj);
    // First update the colour for local display.
    $scope.$parent.colors[schedule.id] = $scope.getSchedColor(schedule);
    $scope.updateSchedule(schedule.id, 'xy', schedule.xy);
  };
  $scope.updateCron = function(schedule, cronField, cronValue) {
    schedule.cron[cronField] = cronValue;
    $scope.updateSchedule(schedule.id, 'cron', schedule.cron);
  };
  /**
   * Create a new default schedule via the API, refresh the schedule list
   * and open editing mode for that schedule.
   */
  $scope.createSchedule = function() {
    var request = {'xy' : Color.xyPoint(0.3548,0.3489),
                   'cron' : {'minute' : '0',
                             'hour'   : '15',
                             'day'    : '*',
                             'month'  : '*',
                             'weekday': '*'},
                   'transitiontime' : 50};
    var postConfig = {timeout : config.timeout};
    var url = config.apiUrl + '/schedule';
    $http.post(url, request, postConfig)
      .success(function(data) {
        if (typeof data['_id']['$oid'] === 'string') {
          var scheduleId = data['_id']['$oid'];
          $scope.syncList();
          $scope.toggleEdit(scheduleId);
        }
      });
  };
  $scope.updateSchedule = function(scheduleId, fieldName, fieldValue) {
    var request = {};
    var putConfig = {timeout : config.timeout};
    var url = config.apiUrl + '/schedule/' + scheduleId;
    request[fieldName] = fieldValue;
    $http.put(url, request, putConfig);
  }
  $scope.delSchedule = function(schedule) {
    if ($state.is('schedules.edit')) {
      var delConfig = {timeout : config.timeout};
      $http.delete(config.apiUrl + '/schedule/' + schedule.id, delConfig)
        .success(function(data) {
          $scope.syncList();
        });
    }
    $state.go('^');
  };
  $scope.syncList();
  $scope.cron = Cron;
  $scope.dayClass = function(enabled) {
    return enabled ? 'dayOn' : 'dayOff';
  };
  $scope.toggleDay = function(schedule, day) {
    if (typeof schedule.weekday[day] === 'boolean') {
      var weekdayLength = Cron.weekdayArrFromObj(schedule.weekday).length;
      // Prevent the user from turning off all week days.
      if (!(weekdayLength < 2 && schedule.weekday[day])) {
        schedule.weekday[day] = !schedule.weekday[day];
        $scope.updateCron(schedule, 'weekday', Cron.getCronFromWeekdays(schedule.weekday, Cron.weekdayArrFromObj));
      }
     }
  };
  $scope.getXy = function(event) {
    var position = event.target.getBoundingClientRect();
    var x = event.clientX - position.left;
    var y = event.clientY - position.top;
    var height = position.height;
    var width = position.width;

    return Color.getXy(height, width, x, y);
  };
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
