'use strict';

var scheduleCtrl = angular.module('editCtrl', ['illuminati-conf']);

scheduleCtrl.controller('editCtrl', ['$scope', '$stateParams', '$state', '$http', 'config', 'Color', 'Cron', '$window', function($scope, $stateParams, $state, $http, config, Color, Cron, $window) {
  // Prevent images (e.g. color triangle) from being draggable.
  $window.ondragstart = function() {return false;};

  $scope.minBri = 0;
  $scope.maxBri = 255;
  $scope.bri = 255;
  $scope.alert = 'none';
  $scope.label = '';
  $scope.hour = 12;
  $scope.minute = 0;
  $scope.on = true;
  $scope.xy = Color.xyPoint(0.3548,0.3489);
  $scope.transTime= 20;
  $scope.weekDay = {'mon' : true,
                 'tue' : true,
                 'wed' : true,
                 'thu' : true,
                 'fri' : true,
                 'sat' : true,
                 'sun' : true};

  if ($state.is('schedules.edit')) {
    var getConfig = {timeout: config.timeout};
    var getUrl = config.apiUrl + '/schedule/' + $stateParams['scheduleid'];
    $http.get(getUrl, getConfig)
      .success(function(data) {
        var setVal = function(property, defVal, callback) {
          if (typeof property !== 'undefined' && property !== null) {
            if (typeof callback === 'function') {
              return callback(property);
            }
            return property;
          } else {
            return defVal;
          }
        }
        $scope.bri = setVal(data['bri'], $scope.bri, parseInt);
        $scope.label = setVal(data['label'], $scope.label);
        $scope.on = setVal(data['on'], $scope.on);
        $scope.xy = setVal(data['xy'], $scope.xy);
        $scope.transTime = setVal(data['transitiontime'],
                                  $scope.transTime,
                                  parseInt);
        $scope.alert = setVal(data['alert'], $scope.alert);
        if (Cron.isCronAdvanced(data['cron'])) {
          //TODO: Handle advanced cron specs properly.
          console.log('Advanced cron specs not yet supported.');
        } else {
          $scope.minute = setVal(data['cron']['minute'],
                                 $scope.minute,
                                 parseInt);
          $scope.hour = setVal(data['cron']['hour'],
                                 $scope.hour,
                                 parseInt);
          $scope.weekDay = setVal(data['cron'],
                                  $scope.weekDay,
                                  Cron.getCronWeekdays);
        }
      });

  }
  $scope.getXy = function(event) {
    var position = event.target.getBoundingClientRect();
    var x = event.clientX - position.left;
    var y = event.clientY - position.top;
    var height = position.height;
    var width = position.width;

    return Color.getXy(height, width, x, y);
  };
  $scope.dayClass = function(enabled) {
    return enabled ? 'dayOn' : 'dayOff';
  };
  $scope.toggleDay = function(day) {
    if (typeof $scope.weekDay[day] === 'boolean') {
      var weekdayLength = Cron.weekdayArrFromObj($scope.weekDay).length;
      // Prevent the user from turning off all week days.
      if (!(weekdayLength < 2 && $scope.weekDay[day])) {
        $scope.weekDay[day] = !$scope.weekDay[day];
      }
    }
  };
  $scope.saveSchedule = function() {
    var request = {};
    var wdF = Cron.weekdayArrFromObj;
    request.xy = $scope.xy;
    request.bri = $scope.bri;
    request.label = $scope.label;
    request.on = $scope.on;
    request.transitiontime = $scope.transTime;
    request.alert = $scope.alert;
    request.cron = {'minute' : String($scope.minute),
                    'hour'   : String($scope.hour),
                    'day'    : '*',
                    'month'  : '*',
                    'weekday': Cron.getCronFromWeekdays($scope.weekDay, wdF)};
    if ($state.is('schedules.new')) {
      var postConfig = {timeout : config.timeout};
      $http.post(config.apiUrl + '/schedule', request, postConfig)
        .success(function(data) {
          var success = 'Schedule created with ID: "' + data['_id']['$oid'];
          // Refresh schedules list by calling syncList on parent controller.
          $scope.syncList();
        });
    } else if ($state.is('schedules.edit')) {
      var putConfig = {timeout : config.timeout};
      var url = config.apiUrl + '/schedule/' + $stateParams['scheduleid'];
      $http.put(url, request, putConfig)
        .success(function(data) {
          var success = 'Schedule "' + data['_id']['$oid'] + '" updated.';
          // Refresh schedules list by calling syncList on parent controller.
          $scope.syncList();
        });
    }
    // Close edit modal and return to schedules list.
    $state.go('^');
  };
  $scope.delSchedule = function() {
    if ($state.is('schedules.edit')) {
      var delConfig = {timeout : config.timeout};
      var id = $stateParams['scheduleid'];
      $http.delete(config.apiUrl + '/schedule/' + id, delConfig)
        .success(function(data) {
          $scope.syncList();
        });
    }
    $state.go('^');
  };
}]);
