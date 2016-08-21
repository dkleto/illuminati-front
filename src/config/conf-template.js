
var config = {'apiUrl' : '@@apiUrl',
              'timeout': parseInt('@@timeout'),
              'env'    : '@@env'};

angular.module('illuminati-conf',[])  
  .constant('config', config);
