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

gulp.task('default', function(){
	gulp.src(['./scripts/directives/panzoom.js', './scripts/directives/panzoomwidget.js'])
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(concat('panzoom.0.1-snapshot.min.js'))
    .pipe(gulp.dest('./build'));

	gulp.src(['./scripts/directives/panzoom.js', './scripts/directives/panzoomwidget.js'])
    .pipe(concat('panzoom.0.1-snapshot.js'))
    .pipe(gulp.dest('./build'));

    gulp.src('./scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./build'));
});

gulp.task('jshint', function(){
	// see .jshintrc for configuration
	gulp.src('./scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});
