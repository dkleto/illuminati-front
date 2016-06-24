'use strict';

describe('illuminati services', function() {

  var Color, Cron, gamutB, wideGamut;
  beforeEach(module('illuminati'));
  beforeEach(function() {
    inject(function($injector) {
      Color = $injector.get('Color');
      Cron = $injector.get('Cron');
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
      expect(Color.pointInGamut(Color.xyPoint(0.9, 0.9), gamutB)).toEqual(false);
      expect(Color.pointInGamut(Color.xyPoint(0.1, 0.3), gamutB)).toEqual(false);

      // Check points that should be inside gamut.
      expect(Color.pointInGamut(Color.xyPoint(0.3, 0.3), gamutB)).toEqual(true);
    });
  });

  describe('xyPoint', function(){
    it('should return xy object when given valid x and y values', function() {
      expect(Color.xyPoint(-0.5,0.5)).toEqual({'x' : -0.5, 'y' : 0.5});
    });

    it('should throw an error for invalid xy values', function() {
      var noxy = {};
      expect(function() {Color.xyPoint(noxy['x'],noxy['y']);}).toThrow(new Error('"undefined" is not an integer'));
      expect(function() {Color.xyPoint('NaN',2);}).toThrow(new Error('"NaN" is not an integer'));
      expect(function() {Color.xyPoint(-2,2);}).toThrow(new Error('"-2" is not an integer between -1 and 1'));
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

 describe('getCronWeekdays', function() {
   it('should generate an object representing a weekday schedule', function() {
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
      expect(function() {Cron.isCronAdvanced(invalidCron);}).toThrow(new Error('Invalid cron spec ' + JSON.stringify(invalidCron)));

      // Missing minute value.
      var invalidCron = {'hour'  : '*',
                         'day'    : '*',
                         'month'  : '*',
                         'weekday': '*'};
      expect(function() {Cron.isCronAdvanced(invalidCron);}).toThrow(new Error('Invalid cron spec ' + JSON.stringify(invalidCron)));
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
});
