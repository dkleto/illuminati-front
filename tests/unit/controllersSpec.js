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

    });

    it('should throw an error for incorrect xy type', function() {
      // Check incorrect type for xy.
      var invalid = {'xy' : 'Clearly not an object'};
      expect(function() {scope.getSchedColor(invalid);}).toThrow(new Error('XY has incorrect type: "string"'));
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
      expect(scope.pointInGamut(scope.xyPoint(0.9, 0.9), gamutB)).toEqual(false);
      expect(scope.pointInGamut(scope.xyPoint(0.1, 0.3), gamutB)).toEqual(false);

      // Check points that should be inside gamut.
      expect(scope.pointInGamut(scope.xyPoint(0.3, 0.3), gamutB)).toEqual(true);
    });
  });

  describe('xyPoint', function(){
    it('should return xy object when given valid x and y values', function() {
      expect(scope.xyPoint(-0.5,0.5)).toEqual({'x' : -0.5, 'y' : 0.5});
    });

    it('should throw an error for invalid xy values', function() {
      var noxy = {};
      expect(function() {scope.xyPoint(noxy['x'],noxy['y']);}).toThrow(new Error('"undefined" is not an integer'));
      expect(function() {scope.xyPoint('NaN',2);}).toThrow(new Error('"NaN" is not an integer'));
      expect(function() {scope.xyPoint(-2,2);}).toThrow(new Error('"-2" is not an integer between -1 and 1'));
    });
  });
  describe('closestPointOnLine', function(){
    it('should find correct closest point', function() {
      var v1 = {'x' : 0.2, 'y' : 0.5};
      var v2 = {'x' : 0.4, 'y' : 0.5};
      var point = {'x' : 0.2, 'y' : 0.2};
      expect(scope.closestPointOnLine(v1, v2, point)).toEqual(v1);
    });
  });
});
