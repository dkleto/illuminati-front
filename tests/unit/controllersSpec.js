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
});

describe('live controller', function() {

  var scope, ctrl, $httpBackend;
  beforeEach(module('illuminati'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    ctrl = $controller('liveCtrl', {$scope: scope});
  }));
  describe('getXy', function() {
    var event = {};
    var target = {};
    target.getBoundingClientRect = function() {
      return this.position;
    };
    event.target = target;
    event.clientX = 400;
    event.clientY = 500;

    // Height and width should be non-zero.
    event.target.position = {left : 400,
                             right : 500,
                             height : 300,
                             width : 0};
    expect(function() {scope.getXy(event);}).toThrow(new Error('Invalid height and width values'));
    // Height and width should be positive.
    event.target.position = {left : 400,
                             right : 500,
                             height : -200,
                             width : 300};
    expect(function() {scope.getXy(event);}).toThrow(new Error('Invalid height and width values'));
    // x, y should be at least equal to element left and top values.
    // x, y should be less than or equal to width and height respectively.
    // Result for valid input should be a valid xyPoint object.
  });
});
