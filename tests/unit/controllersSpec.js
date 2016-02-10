'use strict';

describe('Illuminati controllers', function() {

  beforeEach(module('illuminati'));

  describe('scheduleCtrl', function(){
    var $scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $scope = $rootScope.$new();
      $scope.bla = 'thing';
      ctrl = $controller('scheduleCtrl', {$scope: $scope});
    }));

    it('should generate white background colour by default', function() {
      var result = $scope.getSchedColor({});
      expect(typeof result).toEqual('object');
      expect(typeof result['background-color']).toEqual('string');
      expect(result['background-color']).toEqual('#FFFFFF');
    });
  });
});
