'use strict';

describe('schedule controller', function() {

  var scope, ctrl, $httpBackend;
  beforeEach(module('illuminati'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    ctrl = $controller('scheduleCtrl', {$scope: scope});
  }));

  describe('getSchedColor', function(){
    it('should generate white background colour by default', function() {
      // Check missing xy property.
      var result = scope.getSchedColor({});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');

      // Check incorrect type for xy.
      result = scope.getSchedColor({'xy' : 'Clearly not an object'});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');

      // Check missing xy.y and xy.x
      result = scope.getSchedColor({'xy' : {}});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');

      // Check incorrect type for xy.y and xy.x
      result = scope.getSchedColor({'xy' : {'x' : 'NaN', 'y': {}}});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');
    });
  });
  describe('rgbToHex', function(){
    it('should calculate hex colour values from rgb', function() {
      // Check complete black.
      expect(scope.rgbToHex(0, 0, 0)).toEqual('#000000');

      // Check complete white.
      expect(scope.rgbToHex(1, 1, 1)).toEqual('#FFFFFF');

      // Try bright purple.
      expect(scope.rgbToHex(0.541,0.169,0.886)).toEqual('#8A2BE2')

      // Try bright blue.
      expect(scope.rgbToHex(0,0,1)).toEqual('#0000FF')
    });
  });

  describe('xyToRgb', function(){
    it('should calculate rgb colour values from xy coordinates', function() {
      // Check bright blue.
      var blueRgb = {'r' : 0, 'g' : 0, 'b' : 1};
      var point = {'x' : 0.168, 'y' : 0.041};
      expect(scope.xyToRgb(point)).toEqual(blueRgb);
    });
  });

  describe('pointInGamut', function(){
    it('should check if point fits within colour gamut', function() {
      var gamutB = {
        'r' : {'x' : 0.675, 'y' : 0.322},
        'g' : {'x' : 0.409, 'y' : 0.518},
        'b' : {'x' : 0.167, 'y' : 0.04}
      };
      // Check points that should be outside gamut.
      expect(scope.pointInGamut(0.9, 0.9, gamutB)).toEqual(false);
      expect(scope.pointInGamut(0.1, 0.3, gamutB)).toEqual(false);

      // Check points that should be inside gamut.
      expect(scope.pointInGamut(0.3, 0.3, gamutB)).toEqual(true);
    });
  });

  describe('xyPoint', function(){
    it('should throw an error for invalid xy values', function() {
      expect(function() {scope.xyPoint('NaN',2);}).toThrow(new Error('"NaN" is not an integer'));
      expect(function() {scope.xyPoint(-1,2);}).toThrow(new Error('"-1" is not an integer between 0 and 1'));
    });
  });
});
