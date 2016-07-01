
var config = {'apiUrl' : '@@apiUrl',
              'timeout': parseInt('@@timeout')};

angular.module('illuminati-conf',[])  
  .constant('config', config);
