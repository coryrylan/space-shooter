﻿var gulp = require('gulp');
var plug = require('gulp-load-plugins')();
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma').server;

var jsLibraries = [
    './App/Libraries/requestAnimationFramePolly.js',
    './App/Libraries/jquery.js',
    './App/Libraries/howler.js'
];

var jsSource = [
    './App/Src/*.js'
];

var specSource = [
    './Specs/*.js'
];

var sassSource = [
    './App/Content/Sass/**/*.scss'
];

gulp.task('watch', function() {
    gulp.watch(sassSource, ['styles']).on('error', catchError);
    gulp.watch(jsSource, ['hint', 'js', 'tdd']);
    gulp.watch(specSource, ['hint', 'js', 'tdd']);
});

gulp.task('styles', function() {
    return gulp
        .src(sassSource)
        .pipe(plug.rubySass({ style: 'expanded' }))
        .pipe(plug.autoprefixer('last 2 version', 'ie8', 'ie9'))
        .pipe(gulp.dest('./Build/Css'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.minifyCss())
        .pipe(gulp.dest('./Build/Css'));
});

gulp.task('hint', function() {
    return gulp
        .src(jsSource.concat(specSource))
        .pipe(plug.jscs({ esnext: true })).on('error', catchError)
        .pipe(plug.jshint())
        .pipe(plug.jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {

    // App
    browserify('./App/JavaScript/Src/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./Build/Js'));

    // Specs
    browserify('./Specs/specs.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source('specs.js'))
        .pipe(gulp.dest('./Build/Js'));

    // Libraries
    gulp.src(jsLibraries)
        .pipe(plug.concat('lib.js'))
        .pipe(gulp.dest('./Build/Js'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.uglify({ mangle: true }))
        .pipe(gulp.dest('./Build/Js'));
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('tdd', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});

var catchError = function(err) {
    console.log(err);
    this.emit('end');
};
