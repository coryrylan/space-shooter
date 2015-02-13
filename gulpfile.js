var gulp = require('gulp');
var plug = require('gulp-load-plugins')();
var to5 = require('gulp-6to5');

var jsLibraries = [
    './App/JavaScript/Libraries/requestAnimationFramePolly.js',
    './App/JavaScript/Libraries/jquery.js',
    './App/JavaScript/Libraries/howler.js',
    //'./App/JavaScript/PollyfillsAndShims/es6-module-loader.js'
];

var jsSource = [
    //'./App/JavaScript/Src/**/*.js'
    './App/JavaScript/Src/engine.js',
    './App/JavaScript/Src/ship.js',
    './App/JavaScript/Src/app.js'
];

var sassSource = [
    './App/Content/Sass/**/*.scss'
];

gulp.task('watch', function() {
    gulp.watch(sassSource, ['styles']).on('error', catchError);
    gulp.watch(jsSource, ['hint', 'js']);
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

gulp.task('js', function() {
    return gulp
        .src(jsLibraries.concat(jsSource))
        .pipe(to5())
        .pipe(plug.concat('all.js'))
        .pipe(gulp.dest('./Build/Js'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.uglify({ mangle: true }))
        .pipe(gulp.dest('./Build/Js'));
});

gulp.task('hint', function() {
    return gulp
        .src(jsSource)
        .pipe(plug.jscs({ esnext: true })).on('error', catchError)
        .pipe(plug.jshint())
        .pipe(plug.jshint.reporter('jshint-stylish'));
});

var catchError = function(err) {
    console.log(err);
    this.emit('end');
};
