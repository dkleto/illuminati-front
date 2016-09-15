var gulp = require('gulp')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var replaceTask = require('gulp-replace-task');
var args = require('yargs').argv;
var fs = require('fs');
var download = require('gulp-download');
var rename = require('gulp-rename');
var batchReplace = require('gulp-batch-replace');

var paths = {
    files: ['src/**/*.css', 'src/**/*.html', 'src/**/*.png'],
    js: ['src/*.js', 'src/controllers/*.js', 'src/services/*.js', 'src/config/conf.js'],
    filesdist: ['dist/**/*', '!dist/**/*.js'],
    jsdist: ['dist/**/*.js', 'dist/config']
}


/* Pull in env variables from a json file and generate a conf.js file */
gulp.task('replace', function () {
  var env = args.eng || 'local';
  var path = 'src/config/';
  var filename = 'conf.js';
  var template = 'src/config/conf-template.js';
  var conf = JSON.parse(fs.readFileSync(path + env + '.json', 'utf8'));

  del(path + filename);

  gulp.src(template)
    .pipe(replaceTask({
      patterns: [
        {
          match: 'apiUrl',
          replacement: conf.apiUrl
        },
        {
          match: 'timeout',
          replacement: conf.timeout
        },
        {
          match: 'env',
          replacement: conf.env
        }
      ]
    }))
    .pipe(concat(filename))
    .pipe(gulp.dest(path));
});

/* Remove files in dist dir in preparation for build */
gulp.task('clean:js', function() {
    del(paths.jsdist);
});
gulp.task('clean:files', function() {
    del(paths.filesdist);
});

/* Uglify and concatenate JS files and save the result in the dist dir */
gulp.task('js', ['clean:js'], function () {
    if (!fs.existsSync(paths.conf)) {
       gulp.task('replace');
    }
    gulp.src(paths.js)
            .pipe(sourcemaps.init())
            .pipe(concat('all.min.js'))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});

/* Copy CSS and html files to the dist dir */
gulp.task('files', ['clean:files'], function () {
    gulp.src(paths.files)
        .pipe(gulp.dest('dist'));
})

gulp.task('build', ['files', 'js']);

gulp.task('watch', function() {
    gulp.watch(paths.files, ['files']);
    gulp.watch(paths.js, ['js']);
});

// Save external dependencies for local development work.

// Unfortunately dependencies are hard-coded for now...
var deps = {'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular.min.js' : 'angular.min.js',
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.9/angular-route.min.js' : 'angular-route.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.3.0/angular-ui-router.min.js' : 'angular-ui-router.min.js',
            'https://fonts.googleapis.com/css?family=Roboto:400' : 'roboto.css'
           };

gulp.task('offline', ['offline-replace'], function () {
    download(Object.keys(deps))
        .pipe(rename(function (path) {
            // Get the output file name.
            for (var url in deps) {
                if(url.replace(/.*\//, '') === path.basename) {
                    // Split the output filename and use it to set the path.
                    path.extname = deps[url].replace(/.*\./, '.');
                    var base = deps[url].match(/.*\./)[0];
                    path.basename = base.substr(0, base.length - 1);
                }
            };
        }))
        .pipe(gulp.dest('dist/.offline'));
});

gulp.task('offline-replace', function () {
    // Generate an array to pass to batchReplace.
    var replaceArr = [];
    for (var url in deps) {
        replaceArr.push([url, '.offline/' + deps[url]]);
    }

    gulp.src('src/index.html')
        .pipe(batchReplace(replaceArr))
        .pipe(gulp.dest('dist'));
});
