var gulp = require('gulp');
var plug = require('gulp-load-plugins')();

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var jsLibraries = [
    './App/JavaScript/Libraries/requestAnimationFramePolly.js',
    './App/JavaScript/Libraries/jquery.js',
    './App/JavaScript/Libraries/howler.js'
];

var jsSource = [
    //'./App/JavaScript/Src/**/*.js'
    './App/JavaScript/Src/engine.js',
    './App/JavaScript/Src/ship.js',
    './App/JavaScript/Src/laser.js',
    './App/JavaScript/Src/lasers.js',
    './App/JavaScript/Src/asteroids.js',
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

gulp.task('hint', function() {
    return gulp
        .src(jsSource)
        .pipe(plug.jscs({ esnext: true })).on('error', catchError)
        .pipe(plug.jshint())
        .pipe(plug.jshint.reporter('jshint-stylish'));
});

gulp.task('js', function() {

    browserify('./App/JavaScript/Src/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./Build/Js'));

    gulp.src(jsLibraries)
        .pipe(plug.concat('lib.js'))
        .pipe(gulp.dest('./Build/Js'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.uglify({ mangle: true }))
        .pipe(gulp.dest('./Build/Js'));
});

var catchError = function(err) {
    console.log(err);
    this.emit('end');
};
