'use strict';

var scheduleCtrl = angular.module('scheduleCtrl', ['illuminati-conf']);

scheduleCtrl.controller('scheduleCtrl', ['$scope', '$http', 'config', 'Color', 'Cron', '$state', '$stateParams', '$location', '$mdDialog', '$mdpTimePicker', function($scope, $http, config, Color, Cron, $state, $stateParams, $location, $mdDialog, $mdpTimePicker) {


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
  $scope.scheduleState = {};
  $scope.syncList = function() {
    // Pull down all schedules and build an array of schedule objects.
    $http.get(config.apiUrl + '/schedules')
      .success(function(data) {
        $scope.schedules = data;
        for (var i=0; i < $scope.schedules.length; i++) {
          var schedule = $scope.schedules[i];
          schedule.id = schedule['_id']['$oid'];
          if ($scope.isEditEnabled(schedule.id)) {
            $scope.editTransTime = schedule.transitiontime;
          }
          // Set timestamp for schedule sorting.
          schedule.timeStamp = Date.parse(schedule.creationtime);
          $scope.scheduleState[schedule.id] = {'transitiontime' : schedule.transitiontime};
          if (schedule.on ) {
            $scope.scheduleState[schedule.id]['colour'] = $scope.getSchedColor(schedule);
          } else {
            // Set grey background if light is off.
            $scope.scheduleState[schedule.id]['colour'] = {'background-color' : '#999999'};
          }

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
        $scope.editTransTime = $scope.scheduleState[schedId]['transitiontime'];
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
  $scope.updateCron = function(schedule, cronField, cronValue) {
    schedule.cron[cronField] = cronValue;
    $scope.updateSchedule(schedule.id, {'cron' : schedule.cron});
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
  /**
   * Update light status and then resync to change appearance of the schedule
   * card.
   */
  $scope.updateOn = function(scheduleId, value) {
    $scope.updateSchedule(scheduleId, value);
    $scope.syncList();
  };
  /**
   * Update a given schedule via the API.
   *
   * @param string scheduleId  Valid schedule ID.
   * @param object data        Request data object.
   */
  $scope.updateSchedule = function(scheduleId, data) {
    if (typeof scheduleId !== 'string') {
        throw new Error('Schedule ID has incorrect type: "' +
                        typeof scheduleId + '"');
    }
    if (typeof data !== 'object') {
        throw new Error('Input data has incorrect type: "' +
                        typeof data + '"');
    }
    var putConfig = {timeout : config.timeout};
    var url = config.apiUrl + '/schedule/' + scheduleId;
    $http.put(url, data, putConfig);
  };
  /**
   * Delete a given schedule via the API.
   * and open editing mode for that schedule.
   *
   * @param object schedule  Valid schedule object.
   */
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
  $scope.showColourDialog = function(ev, schedule) {
    $mdDialog.show({
      controller: 'colourCtrl',
      templateUrl: 'partials/colour.html',
      locals: {
          bri : schedule.bri,
          xy : schedule.xy,
          $scope : $scope
      },
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(result) {
      schedule.xy = result.xy;
      schedule.bri = result.bri;
      // First update the colour for local display.
      $scope.scheduleState[schedule.id]['colour'] = $scope.getSchedColor(schedule);
      $scope.updateSchedule(schedule.id, result);
    });
  };
  /**
   * If edting is enabled for the provided schedule, prevent propagation for
   * the provided click event.
   *
   * @param object ev        Click event object.
   * @param object schedule  Schedule ID.
   */
  $scope.stopEditToggle = function(ev, scheduleId) {
      if ($scope.isEditEnabled(scheduleId)) {
        ev.stopPropagation();
      }
  }
  /**
   * If the provided schedule is currently in edit mode, open a timepicker
   * dialog and prevent the editing state from being toggled. If it is not
   * in edit mode, just open the dialog and allow the edit state to be enabled.
   *
   * @param object ev        Click event object.
   * @param object schedule  Schedule object.
   */
  $scope.editTime = function(ev, schedule) {
      $scope.stopEditToggle(ev, schedule['_id']['$oid']);
      $scope.showTimePicker(ev, schedule);
  }
  /**
   * Open a timepicker dialog and set the time for a schedule.
   *
   * @param object ev        Click event object.
   * @param object schedule  Schedule object to set the hour and minute on.
   */
  $scope.showTimePicker = function(ev, schedule) {
    var timeStr = schedule.cron.hour + ':' + schedule.cron.minute;
    $mdpTimePicker(moment(timeStr, 'HH:mm'), {
      targetEvent: ev
    }).then(function(selectedTime) {
      var time = moment(selectedTime);
      schedule.cron.hour = time.format('HH');
      schedule.cron.minute = time.format('mm');
      $scope.updateSchedule(schedule.id, {'cron':schedule.cron});
    });;
  }
}]);
