var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var jsLibraries = [
    './app/libraries/requestAnimationFramePolly.js',
    './app/libraries/jquery.js',
    './app/libraries/howler.js'
];

var jsSource = [
    './app/src/**/*.js'
];

var jsSpecSrc = [

];

var sassSrc = [
    './styles/**/*.scss'
];

gulp.task('build.sass', function () {
    return gulp.src('./styles/app.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .on('error', swallowError)
        .pipe(sourcemaps.write('./'))
        .pipe(rename('app.min.css'))
        .pipe(gulp.dest('build'));
});

gulp.task('js-hint', function() {
    return gulp
        .src(jsSource.concat(jsSpecSrc))
        .pipe(jscs({ esnext: true })).on('error', swallowError)
        .pipe(jshint());
});

gulp.task('build.js', function() {
    // App
    browserify('./app/src/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./build/js'));

    // Libraries
    gulp.src(jsLibraries)
        .pipe(concat('lib.js'))
        .pipe(gulp.dest('./build/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify({ mangle: true }))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('watch', function () {
    gulp.watch(sassSrc, ['build.sass']);
    gulp.watch(jsSource, ['js-hint', 'build.js']);
});

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}
