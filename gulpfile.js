var gulp = require('gulp');
var plug = require('gulp-load-plugins')();
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var karma = require('karma').server;

var jsLibraries = [
    './app/libraries/requestAnimationFramePolly.js',
    './app/libraries/jquery.js',
    './app/libraries/howler.js'
];

var jsSource = [
    './app/src/**/*.js'
];

var specSource = [
    './specs/*.js'
];

var sassSource = [
    './app/content/sass/**/*.scss'
];

gulp.task('watch', function() {
    gulp.watch(sassSource, ['styles']).on('error', catchError);
    gulp.watch(jsSource, ['hint', 'js', 'tdd']);
    //gulp.watch(specSource, ['hint', 'js', 'tdd']);
});

gulp.task('styles', function() {
    return gulp
        .src(sassSource)
        .pipe(plug.rubySass({ style: 'expanded' }))
        .pipe(plug.autoprefixer('last 2 version', 'ie8', 'ie9'))
        .pipe(gulp.dest('./build/css'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.minifyCss())
        .pipe(gulp.dest('./build/Css'));
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
    browserify('./app/src/app.js', { debug: true })
        .transform(babelify)
        .bundle()
        .on('error', function(err) { console.log('Error: ' + err.message); })
        .pipe(source('app.js'))
        .pipe(gulp.dest('./build/js'));

    // Specs
    //browserify('./specs/specs.js', { debug: true })
    //    .transform(babelify)
    //    .bundle()
    //    .on('error', function(err) { console.log('Error: ' + err.message); })
    //    .pipe(source('specs.js'))
    //    .pipe(gulp.dest('./build/js'));

    // Libraries
    gulp.src(jsLibraries)
        .pipe(plug.concat('lib.js'))
        .pipe(gulp.dest('./build/js'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.uglify({ mangle: true }))
        .pipe(gulp.dest('./build/js'));
});

gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('tdd', function (done) {
    //karma.start({
    //    configFile: __dirname + '/karma.conf.js'
    //}, done);
});

var catchError = function(err) {
    console.log(err);
    this.emit('end');
};
