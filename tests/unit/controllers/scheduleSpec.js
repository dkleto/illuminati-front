'use strict';

describe('schedule controller', function() {
  var scope, ctrl, $httpBackend;

  beforeEach(module('illuminati'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    ctrl = $controller('scheduleCtrl', {$scope: scope});
  }));

  describe('getSchedColor', function() {
    it('should generate white background colour by default', function() {
      // Check missing xy property.
      var result = scope.getSchedColor({});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');

    });

    it('should throw an error for incorrect xy type', function() {
      // Check incorrect type for xy.
      var invalid = {'xy' : 'Clearly not an object'};
      expect(function() {scope.getSchedColor(invalid);}).toThrow(new Error('XY has incorrect type: "string"'));
    });
  });

 describe('isScheduleAdvanced', function() {
   it('should return false if cron property is not set', function() {
      expect(scope.isScheduleAdvanced({'nothing' : 'nothing'})).toBeFalsy();
   });
   it('should throw an exception for invalid cron values', function() {
      // Invalid hour spec.
      var invalidCron = {'cron' :
                            {'minute' : '*',
                             'hour'   : 'notValid',
                             'day'    : '*',
                             'month'  : '*',
                             'weekday': '*'}
                        };
      expect(function() {scope.isScheduleAdvanced(invalidCron);}).toThrow(new Error('Invalid cron spec ' + JSON.stringify(invalidCron.cron)));

      // Missing minute value.
      var invalidCron = {'cron' :
                             {'hour'  : '*',
                              'day'    : '*',
                              'month'  : '*',
                              'weekday': '*'}
                        };
      expect(function() {scope.isScheduleAdvanced(invalidCron);}).toThrow(new Error('Invalid cron spec ' + JSON.stringify(invalidCron.cron)));
   });

   it('should return false for straightforward cron spec', function() {
      var simpleCron = {'cron' :
                             {'minute'   : '30',
                              'hour'   : '9',
                              'day'    : '*',
                              'month'  : '*',
                              'weekday': '6,7'}
                        };

      expect(scope.isScheduleAdvanced(simpleCron)).toBeFalsy();
   });

   it('should return true for complex cron spec', function() {
      // Try complex minute field.
      var complexCron = {'cron' :
                             {'minute'    : '*/5',
                              'hour'   : '*',
                              'day'    : '*',
                              'month'  : '*',
                              'weekday': '*'}
                        };

      expect(scope.isScheduleAdvanced(complexCron)).toBeTruthy();

      // Try using anything other than '*' for month and day.
      var complexCron = {'cron' :
                             {'minute'    : '30',
                              'hour'   : '2',
                              'day'    : '20',
                              'month'  : '3',
                              'weekday': '*'}
                        };

      expect(scope.isScheduleAdvanced(complexCron)).toBeTruthy();
   });
 });
});

