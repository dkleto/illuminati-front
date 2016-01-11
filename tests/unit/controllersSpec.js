'use strict';

describe('Illuminati controllers', function() {

  describe('scheduleCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(module('illuminati'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      scope = $rootScope.$new();
      $httpBackend = _$httpBackend_;
      ctrl = $controller('scheduleCtrl', {$scope: scope});
    }));

    it('should calculate the correct hex color from hsl', function() {
      // Test a few obvious hex colour codes.
      expect(scope.hexFromHsl(255, 255, 255)).toEqual('ffffff');
      expect(scope.hexFromHsl(0, 0, 0)).toEqual('000000');
      expect(scope.hexFromHsl((270/360)*255, 255, 127.5)).toEqual('7f00ff');
    });
  });
});
