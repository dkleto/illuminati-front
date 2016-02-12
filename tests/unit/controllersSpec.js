'use strict';

describe('Illuminati controllers', function() {

  beforeEach(module('illuminati'));

  describe('scheduleCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      ctrl = $controller('scheduleCtrl', {$scope: scope});
    }));

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
});
