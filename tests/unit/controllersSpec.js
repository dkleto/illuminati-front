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

  });
});
