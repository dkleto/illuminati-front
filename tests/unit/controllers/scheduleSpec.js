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

  describe('setVal', function() {
    it('should return default value for null property', function() {
      var def = 'default';
      expect(scope.setVal(null, def, function() {return 'wrong';}))
        .toEqual(def);
    });

    it('should return default value for undefined property', function() {
      var def = 'default';
      var noProp = {};
      var testFunc = function(param) {return 'wrong' + param;};
      expect(scope.setVal(noProp.property, def, testFunc)).toEqual(def);
    });

    it('should return default if invalid function is supplied', function() {
      var def = 'default';
      var prop = 'property';
      var noFunc = {};
      expect(scope.setVal(prop, def, 'notAfunc')).toEqual(def);
      expect(scope.setVal(prop, def, noFunc.testFunc)).toEqual(def);
    });

    it('should apply valid function with valid property param', function() {
      var def = 'wrong';
      var prop = 'property';
      var expectedResult = 'correct' + prop;
      var testFunc = function(param) {
        return 'correct' + param;
      };
      expect(scope.setVal(prop, def, testFunc)).toEqual(expectedResult);
    });
  });

});

