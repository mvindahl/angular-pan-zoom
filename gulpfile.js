/*
 * You need gulp and various dependencies in order to run this. You can get these using
 * npm by executing the following commands in sequence:
 *
 * npm install gulp
 * npm install gulp-concat
 * npm install gulp-uglify
 * npm install gulp-jshint
 * npm install jshint-stylish
 *
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');
var karma = require('gulp-karma');

gulp.task('default', function () {
    gulp.src(['./scripts/directives/panzoom.js', './scripts/directives/panzoomwidget.js', './scripts/services/PanZoomService.js'])
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(concat('panzoom.min.js'))
        .pipe(gulp.dest('./build'));

    gulp.src(['./scripts/directives/panzoom.js', './scripts/directives/panzoomwidget.js', './scripts/services/PanZoomService.js'])
        .pipe(concat('panzoom.js'))
        .pipe(gulp.dest('./build'));

    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./build'));
});

gulp.task('jshint', function () {
    // see .jshintrc for configuration
    gulp.src('./scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

var testFiles = [ // FIXME this is duplicated in karma.conf.js, can we lose it here?
              'bower_components/jQuery/dist/jquery.js',
              'bower_components/angular/angular.js',
              'bower_components/angular-mocks/angular-mocks.js',
              'bower_components/hamsterjs/hamster.js',
              'bower_components/angular-mousewheel/mousewheel.js',
              'scripts/directives/*.js',
              'scripts/services/*.js',
              'test/unit/*.js'];

gulp.task('test', function () {
    // Be sure to return the stream
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('test-phantom', function () {
    // Be sure to return the stream
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: 'test/karma.conf.phantom.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('test-continuous', function () {
    // Be sure to return the stream
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: 'test/karma.continuesrun.conf.js',
            action: 'watch'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});

gulp.task('test-coverage', function () {
    // Be sure to return the stream
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: 'test/karma.conf.coverage.js',
            action: 'run'
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});