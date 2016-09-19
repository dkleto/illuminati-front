var gulp = require('gulp')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var replaceTask = require('gulp-replace-task');
var args = require('yargs').argv;
var fs = require('fs');
var sym = require('gulp-sym');

var paths = {
    files: ['src/**/*.css', 'src/**/*.html', 'src/**/*.png'],
    js: ['src/*.js', 'src/controllers/*.js', 'src/services/*.js', 'src/config/conf.js'],
    filesdist: ['dist/**/*', '!dist/**/*.js', '!dist/node_modules/**'],
    jsdist: ['dist/**/*.js', 'dist/config', '!dist/node_modules/**'],
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

/* Symlink node_modules to make dependencies available for dev work */
gulp.task('deps', [], function() {
    if (!fs.existsSync('dist/node_modules')) {
    gulp.src('node_modules')
      .pipe(sym('dist/node_modules'))
    }
});

gulp.task('build', ['files', 'js', 'deps']);

gulp.task('watch', [], function() {
    gulp.watch(paths.files, ['build']);
    gulp.watch(paths.js, ['build']);
});
