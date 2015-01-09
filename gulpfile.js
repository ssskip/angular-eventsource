var gulp = require('gulp'),
  gutil = require('gulp-util'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename");

gulp.task('scripts', function () {
  return gulp.src('angular.eventsource.js').
    pipe(rename('angular.eventsource.min.js')).
    pipe(uglify({
      preserveComments: 'some',
      outSourceMap: true
    })).
    pipe(gulp.dest('./dist'));
});

gulp.task('default', function () {
  gulp.start('scripts');
});
