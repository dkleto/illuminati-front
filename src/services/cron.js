'use strict';

var cron = angular.module('illuminatiCronService', []);

cron.factory('Cron', [function() {
  var cron = {};

  cron.getCronWeekdays = function(cronInput) {
    if (cron.isCronAdvanced(cronInput)) {
      return false;
    } else {
      // Set up array to map weekdays to integer values.
      var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

      // For "*" we will set all weekdays true.
      if (cronInput['weekday'] === '*') {
        var cronSpec = [1,2,3,4,5,6,7];
      } else {
        var cronSpec = cronInput['weekday'].split(',');
      }

      var result = {};
      // Set all weekdays in result to false.
      for (var i=1; i < days.length; i++) {
        result[days[i]] = false;
      }
      // Iterate through selected weekdays and set them to true in result.
      for (var i=0; i < cronSpec.length; i++) {
        result[days[cronSpec[i]]] = true;
      }
      return result;
    }
  };
  cron.isValidCronField = function(cronField) {
    if (typeof cronField === 'undefined') {
      return false;
    }
    return /^[0-9\/\*,-]+$/.test(cronField);
  };
  cron.isValidCron = function(cronInput, cronTestFunc) {
    var cronFields = ['minute', 'hour', 'day', 'month', 'weekday'];
    // Check each cron value using cronTestFunc function.
    for (var i=0; i < cronFields.length; i++) {
      if (!cronTestFunc(cronInput[cronFields[i]])) {
        return false;
      }
    }
    return true;
  }
  cron.isCronAdvanced = function(cronInput) {

    if (!cron.isValidCron(cronInput, cron.isValidCronField)) {
      throw new Error('Invalid cron spec ' + JSON.stringify(cronInput));
    };

    // Day and month fields should be '*' for simple cron.
    if (cronInput.day != '*' || cronInput.month != '*') {
      return true;
    }

    // Min and hour should be numeric for simple cron.
    var numPattern = /^[0-9][0-9]?$/;
    if (!numPattern.test(cronInput.minute) || !numPattern.test(cronInput.hour)) {
      return true;
    };

    // Weekday field should be '*' or look like 1,6,7 for simple cron.
    var weekPattern = /^\*|([0-7](,[0-7])*)$/;
    if (!weekPattern.test(cronInput.weekday)) {
      return true;
    }

    return false;
  };
  cron.getCronFromWeekdays = function(weekdays) {
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (typeof weekdays !== 'object') {
      throw new Error('Weekdays param must be object');
    }

    // Construct an array of weekday index values.
    var result = [];
    for (var i=0; i < days.length; i++) {
       var type = typeof weekdays[days[i]];
       if (type !== 'boolean') {
         var err = 'Invalid weekday value for \'' + days[i] +
                   '\' expected boolean but got \'' + type + '\'.';
         throw new Error(err);
       }
       if (weekdays[days[i]]) {
         result.push(i + 1);
       }
    }

    // Convert the weekday array into a cron string.
    if (result.length === 0) {
      throw new Error('Invalid cron spec - no weekdays enabled.');
    } else if (result.length === 7) {
      return '*';
    } else {
      return result.join();
    }
  };

  return cron;
}]);
