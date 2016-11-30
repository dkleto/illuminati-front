'use strict';

describe('schedule controller', function() {
  var scope, ctrl, $httpBackend;

  beforeEach(module('illuminati'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET').respond({});
    $httpBackend.when('PUT', /.*\/schedule\/scheduleid/)
      .respond({});
    scope = $rootScope.$new();
    ctrl = $controller('scheduleCtrl', {$scope: scope});
  }));

  describe('getSchedColor', function() {
    it('should generate white background colour by default', function() {
      // Check missing xy property.
      var result = scope.getSchedColor({'on' : true});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('#FFFFFF');

    });
    it('should throw an error for incorrect xy type', function() {
      // Check incorrect type for xy.
      var invalid = {'xy' : 'Clearly not an object', 'on' : true};
      expect(function() {scope.getSchedColor(invalid);}).toThrow(new Error('XY has incorrect type: "string"'));
    });
    it('should return transparent background if light is off', function() {
      var result = scope.getSchedColor({});
      expect(typeof result).toEqual('object');
      expect(result['background-color']).toEqual('transparent');
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

  describe('updateSchedule', function() {
    it('should throw an error for incorrect param types', function() {
      // Check incorrect object type for schedule ID.
      expect(function() {scope.updateSchedule({}, {});}).toThrow(new Error('Schedule ID has incorrect type: "object"'));

      // Check incorrect string type for data object.
      expect(function() {scope.updateSchedule('scheduleid', 'notanobject');}).toThrow(new Error('Input data has incorrect type: "string"'));
    });
  });
});
