var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	babel = require('gulp-babel');
// var	gulpPath = require('gulp-path');
// var notify = require('gulp-notify');

// Set base paths

var paths = {
        images: 'src/images/*',
        scripts: 'src/scripts/*.js',
        styles: 'src/styles/**/*.scss'
    };

gulp.task('copy-dependencies', function() {
	return gulp.src('node_modules/jquery/dist/jquery.min.js')
	  .pipe(gulp.dest('dist/js/vendor'));
});

gulp.task('copy-html', function() {
	return gulp.src('src/index.html')
	  .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del([
    'dist/report.csv',
    // here we use a globbing pattern to match everything inside the `mobile` folder
    'dist/**/*'
  ]);
});

gulp.task('styles', function() {
  return gulp.src(paths.styles)
  	.pipe(sourcemaps.init())
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('dist/css'));
	//.pipe(notify({ message: 'Styles task complete' }));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(sourcemaps.init())
		.pipe(babel({
            presets: ['es2015']
        }))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./dist/js'))
		.pipe(rename('main.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist/js'));
});

// Images
gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/images'));
    //.pipe(notify({ message: 'Images task complete' }));
});

// Watch
gulp.task('watch', function() {

  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch('src/*.html', ['copy-html']);
  //gulp.watch(paths.images, ['images']);

});

gulp.task('default', ['styles', 'scripts','images','copy-html']);