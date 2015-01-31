var gulp = require('gulp');
var plug = require('gulp-load-plugins')();

var jsLibraries = [
    './App/JavaScript/Libraries/jquery.js',
    './App/JavaScript/Libraries/requestAnimationFramePolly.js',
];

var jsSource = [
    //'./App/JavaScript/Src/**/*.js'
    './App/JavaScript/Src/Engine/engine.js',
    './App/JavaScript/Src/app.js'
];

var sassSource = [
    './App/Content/Sass/**/*.scss'
];

gulp.task('watch', function() {
    gulp.watch(sassSource, ['styles']).on('error', catchError);
    gulp.watch(jsSource, ['js']);
    gulp.watch(jsSource, ['hint']);
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
        .pipe(plug.traceur())
        .pipe(plug.concat('all.js'))
        .pipe(gulp.dest('./Build/Js'))
        .pipe(plug.rename({ suffix: '.min' }))
        .pipe(plug.uglify({ mangle: true }))
        .pipe(gulp.dest('./Build/Js'));
});

gulp.task('hint', function() {
    return gulp
        .src(jsSource)
        .pipe(plug.jscs()).on('error', catchError)
        .pipe(plug.jshint())
        .pipe(plug.jshint.reporter('jshint-stylish'));
});

var catchError = function(err) {
    console.log(err);
    this.emit('end');
};
