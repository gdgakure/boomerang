var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var ngAnnotate = require('gulp-ng-annotate');
var gzip = require('gulp-gzip');

var getBundleName = function () {
  var name = require('./package.json').name;
  return name + '.' + 'min';
};

gulp.task('clean', function (cb) {
    del(['./dist/**'], cb);
});

gulp.task('jshint', ['clean'], function () {
    return gulp.src(['gulpfile.js', './js/**.js', './tests/**.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('concat', ['clean'], function () {
    return gulp.src([
        './js/boomerang.js',
        './js/config.js'
    ])
        .pipe(concat('boomerang.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('javascript', ['clean', 'concat'], function() {
  var bundler = browserify({
    entries: ['./dist/boomerang.js'],
    debug: true
  });

  var bundle = function() {
    return bundler.bundle()
        .pipe(source(getBundleName() + '.js'))
        .pipe(buffer())
        .pipe(ngAnnotate())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .pipe(gzip())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/'));
  };

  return bundle();
});

gulp.task('default', ['jshint', 'javascript']);