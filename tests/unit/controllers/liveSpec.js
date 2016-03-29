'use strict';

describe('live controller', function() {
  var scope, ctrl, $httpBackend;

  beforeEach(module('illuminati'));
  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope.$new();
    ctrl = $controller('liveCtrl', {$scope: scope});
  }));
  describe('getXy', function(){

    it('should validate height and width', function() {
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
                               top : 100,
                               height : 300,
                               width : 0};
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid height and width values - height: ' +
        event.target.position.height + 'width: ' +
        event.target.position.width)
      );

      // Height and width should be positive.
      event.target.position = {left : 400,
                               top : 100,
                               height : -200,
                               width : 300};
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid height and width values - height: ' +
        event.target.position.height + 'width: ' +
        event.target.position.width)
      );
    });

    it('should validate x and y values', function() {
      var event = {};
      var target = {};
      target.getBoundingClientRect = function() {
        return this.position;
      };
      event.target = target;
      event.clientX = 400;
      event.clientY = 500;

      event.target.position = {left : 500,
                               top : 100,
                               height : 200,
                               width : 300};

      // x, y should be greater than zero.
      event.clientX = 300;
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid x and y coordinates - x: ' +
        (event.clientX - event.target.position.left) + ' y: ' +
        (event.clientY - event.target.position.top))
      );

      // x, y should be less than width and height, respectively.
      event.clientY = 1000;
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid x and y coordinates - x: ' +
        (event.clientX - event.target.position.left) + ' y: ' +
        (event.clientY - event.target.position.top))
      );
    });

    it('should return an xyPoint object', function() {
      var event = {};
      var target = {};
      target.getBoundingClientRect = function() {
        return this.position;
      };
      event.target = target;
      event.clientX = 400;
      event.clientY = 500;

      event.target.position = {left : 500,
                               top : 100,
                               height : 200,
                               width : 300};

      // Result for valid input should be a valid xyPoint object.
      event.clientX = 600;
      event.clientY = 200;
      var result = {
        'x' : 1/3,
        'y' : 1 - 1/2
      }
      expect(scope.getXy(event)).toEqual(result);
    });
  });
});
