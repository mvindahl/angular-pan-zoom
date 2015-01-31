/*
 * You need gulp and various dependencies in order to run this. You can get these using
 * npm by executing npm install which will install all dependencies found in package.js
 *
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');

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