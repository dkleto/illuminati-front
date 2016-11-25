module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'node_modules/angular/angular.js',
      'node_modules/angular-ui-router/release/angular-ui-router.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/angular-material/angular-material.js',
      'node_modules/angular-animate/angular-animate.js',
      'node_modules/angular-messages/angular-messages.js',
      'node_modules/angular-aria/angular-aria.js',
      'node_modules/angular-momentjs/angular-momentjs.js',
      'node_modules/moment/moment.js',
      'node_modules/mdPickers/dist/mdPickers.min.js',
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
