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
                               right : 500,
                               height : 300,
                               width : 0};
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid height and width values - height: ' +
        event.target.position.height + 'width: ' +
        event.target.position.width)
      );
                        
      // Height and width should be positive.
      event.target.position = {left : 400,
                               right : 500,
                               height : -200,
                               width : 300};
      expect(function() {scope.getXy(event);}).toThrow(new Error(
        'Invalid height and width values - height: ' +
        event.target.position.height + 'width: ' +
        event.target.position.width)
      );
    });

      // x, y should be at least equal to element left and top values.
      // x, y should be less than or equal to width and height respectively.
      // Result for valid input should be a valid xyPoint object.
  });
});
