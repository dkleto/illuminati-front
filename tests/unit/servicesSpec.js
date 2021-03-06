'use strict';

describe('illuminati services', function() {

  var Color, Cron, gamutB, wideGamut;
  beforeEach(module('illuminati'));
  describe('color', function() {
    beforeEach(function() {
      inject(function($injector) {
        Color = $injector.get('Color');
      });
      gamutB = {
        'r' : {'x' : 0.675, 'y' : 0.322},
        'g' : {'x' : 0.409, 'y' : 0.518},
        'b' : {'x' : 0.167, 'y' : 0.04}
      };
      wideGamut = {
        'r' : {'x' : 0.700607, 'y' : 0.299301},
        'g' : {'x' : 0.172416, 'y' : 0.746797},
        'b' : {'x' : 0.135503, 'y' : 0.039879}
      };
    });

    describe('rgbToHex', function() {
      it('should calculate hex colour values from rgb', function() {
        // Check complete black.
        expect(Color.rgbToHex(0, 0, 0)).toEqual('#000000');

        // Check complete white.
        expect(Color.rgbToHex(1, 1, 1)).toEqual('#FFFFFF');

        // Try bright purple.
        expect(Color.rgbToHex(0.541,0.169,0.886)).toEqual('#8A2BE2')

        // Try bright blue.
        expect(Color.rgbToHex(0,0,1)).toEqual('#0000FF')
      });
    });

    describe('xyToRgb', function(){
      it('should calculate rgb colour values from xy coordinates', function() {
        // Helper function to round resulting rgb objects.
        var roundRgb = function(rgb) {
          return {'r' : +rgb.r.toFixed(3),
                  'g' : +rgb.g.toFixed(3),
                  'b' : +rgb.b.toFixed(3)};
        };
        // Check bright blue.
        var blueRgb = {'r' : 0.308, 'g' : 0, 'b' : 1};
        var point = {'x' : 0.168, 'y' : 0.041};
        expect(roundRgb(Color.xyToRgb(point, gamutB))).toEqual(blueRgb);
      });
    });

    describe('pointInGamut', function(){
      it('should check if point fits within colour gamut', function() {
        // Check points that should be outside gamut.
        expect(Color.pointInGamut(Color.xyPoint(0.9, 0.9), gamutB))
          .toEqual(false);
        expect(Color.pointInGamut(Color.xyPoint(0.1, 0.3), gamutB))
          .toEqual(false);

        // Check points that should be inside gamut.
        expect(Color.pointInGamut(Color.xyPoint(0.3, 0.3), gamutB))
          .toEqual(true);
      });
    });

    describe('xyPoint', function(){
      it('should return xy object when given valid x and y values', function() {
        expect(Color.xyPoint(-0.5,0.5)).toEqual({'x' : -0.5, 'y' : 0.5});
      });

      it('should throw an error for invalid xy values', function() {
        var noxy = {};
        expect(function() {Color.xyPoint(noxy['x'],noxy['y']);})
          .toThrow(new Error('"undefined" is not an integer'));
        expect(function() {Color.xyPoint('NaN',2);})
          .toThrow(new Error('"NaN" is not an integer'));
        expect(function() {Color.xyPoint(-2,2);})
          .toThrow(new Error('"-2" is not an integer between -1 and 1'));
      });
    });

    describe('closestPointOnLine', function(){
      it('should find correct closest point', function() {
        // With point directly below v1, closest point should be v1.
        var v1 = {'x' : 0.2, 'y' : 0.5};
        var v2 = {'x' : 0.4, 'y' : 0.5};
        var point = {'x' : 0.2, 'y' : 0.2};
        expect(Color.closestPointOnLine(v1, v2, point)).toEqual(v1);

        // Point should be closest to the midpoint of v1-v2.
        v1 = {'x' : 0.3, 'y' : 0.1};
        v2 = {'x' : 0.1, 'y' : 0.3};
        point = {'x' : 0.1, 'y' : 0.1};
        var midpoint = {'x' : 0.2, 'y' : 0.2};
        expect(Color.closestPointOnLine(v1, v2, point)).toEqual(midpoint);
      });
    });

    describe('distanceBetweenPoints', function(){
      it('should determine the distance between two points', function() {
        // First test two points on the same horizontal plane.
        var p1 = {'x' : 0.1, 'y' : 0.1};
        var p2 = {'x' : 0.6, 'y' : 0.1};
        expect(Color.distanceBetweenPoints(p1, p2)).toEqual(0.5);

        // Test points on a diagonal plane.
        p1 = {'x' : 0.3, 'y' : 0.1};
        p2 = {'x' : 0.1, 'y' : 0.3};
        expect(Color.distanceBetweenPoints(p1, p2).toFixed(3)).toEqual('0.283');
      });
    });

    describe('closestPointInGamut', function(){
      it('should determine closest point within gamut', function() {
        // Test with point immediately above green vertex.
        var p = {'x' : 0.409, 'y' : 0.7};
        expect(Color.closestPointInGamut(p, gamutB)).toEqual(gamutB.g);
        // Try point near red vertex.
        p = {'x' : 0.7, 'y': 0.35};
        expect(Color.closestPointInGamut(p, gamutB)).toEqual(gamutB.r);
      });
    });

    describe('mapXyToGamut', function(){
      it('should map xy coordinates onto provided gamut', function() {
        // Helper function to round resulting xy points.
        var roundPoint = function(xyPoint) {
          return {'x' : +xyPoint['x'].toFixed(3), 'y' : +xyPoint.y.toFixed(3)};
        };
        // First try topmost tip of gamut (green vertex).
        var xy = {'x' : 0.5, 'y' : 1};
        expect(roundPoint(Color.mapXyToGamut(xy, gamutB))).toEqual(gamutB.g);
        // Try blue vertex of gamut.
        xy = {'x' : 0, 'y' : 0};
        expect(roundPoint(Color.mapXyToGamut(xy, gamutB))).toEqual(gamutB.b);
        // Try red vertex of gamut.
        xy = {'x' : 1, 'y' : 0};
        expect(roundPoint(Color.mapXyToGamut(xy, gamutB))).toEqual(gamutB.r);
      });
    });

    describe('getXy', function(){

      it('should validate height and width', function() {
        // Height and width should be non-zero.
        var height = 300;
        var width = 0;
        var x = 0;
        var y = 400;

        expect(function() {
          Color.getXy(height, width, x, y);
        }).toThrow(new Error('Invalid height and width values - height: ' +
                              height + 'width: ' +
                              width));

        // Height and width should be positive.
        var height = -200;
        var width = 0;
        var x = 0;
        var y = 400;

        expect(function() {
          Color.getXy(height, width, x, y);
        }).toThrow(new Error('Invalid height and width values - height: ' +
                             height + 'width: ' +
                             width));
      });

      it('should validate x and y values', function() {
        // x, y should be greater than zero.
        var height = 200;
        var width = 300;
        var x = -100;
        var y = 400;

        expect(function() {
          Color.getXy(height, width, x, y);
        }).toThrow(new Error('Invalid x and y coordinates - x: ' + x +
                             ' y: ' + y));

        // x, y should be less than width and height, respectively.
        var y = 900;
        expect(function() {
          Color.getXy(height, width, x, y);
        }).toThrow(new Error('Invalid x and y coordinates - x: ' + x +
                             ' y: ' + y));
      });

      it('should return an xyPoint object', function() {
        // Result for valid input should be a valid xyPoint object.
        var width = 300;
        var height = 200;
        var x = 100;
        var y = 100;
        var result = {
          'x' : 1/3,
          'y' : 1 - 1/2
        }
        expect(Color.getXy(height, width, x, y)).toEqual(result);
      });
    });

    describe('getPosition', function() {
      it('should throw an error for non-numeric colour coords', function() {
        expect(function() {
          Color.getPosition({}, 1, 1);
        }).toThrow(new Error('Invalid point: {} x and y must be numbers.'));
      });

      it('should throw an error for non-numeric height or width', function() {
        expect(function() {
          Color.getPosition({'x' : 0.5, 'y' : 0.5}, 'notvalid', null);
        }).toThrow(new Error('Invalid height/width H: "notvalid" W: "null".'
                           + ' Height and width should be numbers.'));
      });

      it('should throw an error for xy values outside 0 and 1', function() {
        expect(function() {
          Color.getPosition({'x' : -0.5, 'y' : 1.2}, 1, 1);
        }).toThrow(new Error('Invalid point: X: -0.5 Y: 1.2 - coordinates '
                           + 'should be between 0,0 and 1,1.'));
      });

      it('should correctly calculate coordinates', function() {
        var input = {'x' : 0.5, 'y' : 0.5};
        var expected = {'left': '38px', 'top' : '62px'};
        expect(Color.getPosition(input, 100, 100)).toEqual(expected);
      });
    });
  });

  describe('cron', function() {
    beforeEach(function() {
      inject(function($injector) {
        Cron = $injector.get('Cron');
      });
    });

    describe('getCronWeekdays', function() {
      it('should generate an object weekday schedule', function() {
        var result = {'mon' : true,
                      'tue' : true,
                      'wed' : true,
                      'thu' : true,
                      'fri' : true,
                      'sat' : false,
                      'sun' : false};
        var cron = {'minute' : '30',
                    'hour'   : '8',
                    'day'    : '*',
                    'month'  : '*',
                    'weekday': '1,2,3,4,5'};
        expect(Cron.getCronWeekdays(cron)).toEqual(result);
      });
    });

    describe('isCronAdvanced', function() {
      it('should throw an exception for invalid cron values', function() {
         // Invalid hour spec.
         var invalidCron = {'minute' : '*',
                            'hour'   : 'notValid',
                            'day'    : '*',
                            'month'  : '*',
                            'weekday': '*'};
         expect(function() {Cron.isCronAdvanced(invalidCron);})
           .toThrow(
             new Error('Invalid cron spec ' + JSON.stringify(invalidCron)));

         // Missing minute value.
         var invalidCron = {'hour'  : '*',
                            'day'    : '*',
                            'month'  : '*',
                            'weekday': '*'};
         expect(function() {Cron.isCronAdvanced(invalidCron);})
           .toThrow(
             new Error('Invalid cron spec ' + JSON.stringify(invalidCron)));
      });

      it('should return false for straightforward cron spec', function() {
         var simpleCron = {'minute'   : '30',
                           'hour'   : '9',
                           'day'    : '*',
                           'month'  : '*',
                           'weekday': '6,7'};

         expect(Cron.isCronAdvanced(simpleCron)).toBeFalsy();

         // Test schedule for every weekday.
         var simpleCron = {'minute'   : '30',
                           'hour'   : '9',
                           'day'    : '*',
                           'month'  : '*',
                           'weekday': '*'};

         expect(Cron.isCronAdvanced(simpleCron)).toBeFalsy();
      });

      it('should return true for complex cron spec', function() {
         // Try complex minute field.
         var complexCron = {'minute'    : '*/5',
                            'hour'   : '*',
                            'day'    : '*',
                            'month'  : '*',
                            'weekday': '*'};

         expect(Cron.isCronAdvanced(complexCron)).toBeTruthy();

         // Try using anything other than '*' for month and day.
         var complexCron = {'minute'    : '30',
                            'hour'   : '2',
                            'day'    : '20',
                            'month'  : '3',
                            'weekday': '*'};

         expect(Cron.isCronAdvanced(complexCron)).toBeTruthy();
      });
    });
    describe('weekdayArrFromObj', function() {
      it('should throw an error for missing day values', function() {
        var missingMon = {'tue' : true,
                          'wed' : false,
                          'thu' : true,
                          'fri' : false,
                          'sat' : false,
                          'sun' : true};
        var err = 'Invalid weekday value for \'mon\'' +
               ' expected boolean but got \'undefined\'.';
        expect(function() {Cron.weekdayArrFromObj(missingMon);})
           .toThrow(new Error(err));
      });

      it('should throw an error for non-boolean day values', function() {
        var nonBoolTue = {'mon' : true,
                          'tue' : 'notBoolean',
                          'wed' : true,
                          'thu' : true,
                          'fri' : true,
                          'sat' : true,
                          'sun' : true};
        var err = 'Invalid weekday value for \'tue\'' +
               ' expected boolean but got \'string\'.';
        expect(function() {Cron.weekdayArrFromObj(nonBoolTue);})
           .toThrow(new Error(err));
      });
    });
    describe('getCronFromWeekdays', function() {
      var wdFunc;
      beforeEach(function() {
        wdFunc = Cron.weekdayArrFromObj;
      });
      it('should throw an error if weekdays param is not an object', function() {
        expect(function() {Cron.getCronFromWeekdays('notObj', wdFunc);})
           .toThrow(new Error('Weekdays param must be object'));
      });

      it('should throw an error if no weekdays are set', function() {
        var noDays = {'mon' : false,
                      'tue' : false,
                      'wed' : false,
                      'thu' : false,
                      'fri' : false,
                      'sat' : false,
                      'sun' : false};
        var err = 'Invalid cron spec - no weekdays enabled.';
        expect(function() {Cron.getCronFromWeekdays(noDays, wdFunc);})
           .toThrow(new Error(err));
      });

      it('should convert weekday mapping into valid cron string', function() {
        // Test  enabled days.
        var everyDay = {'mon' : true,
                       'tue' : true,
                       'wed' : true,
                       'thu' : true,
                       'fri' : true,
                       'sat' : true,
                       'sun' : true};
        expect(Cron.getCronFromWeekdays(everyDay, wdFunc)).toEqual('*');

        // Test alternating enabled days.
        var altDays = {'mon' : true,
                       'tue' : false,
                       'wed' : true,
                       'thu' : false,
                       'fri' : true,
                       'sat' : false,
                       'sun' : true};
        expect(Cron.getCronFromWeekdays(altDays, wdFunc)).toEqual('1,3,5,7');
      });
    });
    describe('getTime', function() {
      it('should return false for invalid cron spec', function() {
        var invalidCron = {'min'  : 'notvalid',
                           'hour' : 'totallynotvalid'};
        expect(Cron.getTime(invalidCron)).toBeFalsy();
      });

      it('should return false for advanced cron spec', function() {
        var complexCron = {'minute' : '*/5',
                           'hour'   : '*',
                           'day'    : '*',
                           'month'  : '*',
                           'weekday': '*'};
        expect(Cron.getTime(complexCron)).toBeFalsy();
      });

      it('should return time string', function() {
        var validCron = {'minute' : '30',
                         'hour'   : '10',
                         'day'    : '*',
                         'month'  : '*',
                         'weekday': '*'};
        expect(Cron.getTime(validCron)).toEqual('10:30');
      });

      it('should pad single digit minute and hour values', function() {
        var validCron = {'minute' : '5',
                         'hour'   : '9',
                         'day'    : '*',
                         'month'  : '*',
                         'weekday': '*'};
        expect(Cron.getTime(validCron)).toEqual('09:05');
      });
    });
  });
});
