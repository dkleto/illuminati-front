module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'node_modules/angular/angular.js',
      'node_modules/angularjs-slider/dist/rzslider.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'dist/**.js',
      'src/**/*.js',
      'tests/unit/**/*.js'
    ],

    autoWatch : true,
    singleRun : true,

    frameworks: ['jasmine',
                 'jasmine-matchers'],

    browsers : ['Firefox'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-jasmine-matchers',
            'karma-junit-reporter',
            'karma-sourcemap-loader'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },

    preprocessors: {
      'dist/all.min.js': ['sourcemap']
    }
  });
};
