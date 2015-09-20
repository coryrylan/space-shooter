'use strict';

let gulp = require('gulp-help')(require('gulp'));
let sass = require('gulp-sass');
let rename = require('gulp-rename');
let tsc = require('gulp-typescript');
let tslint = require('gulp-tslint');
let del = require('del');
let connect = require('connect');
let serveStatic = require('serve-static');
let open = require('open');
let http = require('http');

const DOCS = {
    sassBuild: 'Build Sass and compile out to CSS',
    typescriptBuild: 'Build TypeScript and compile out ES5 JavaScript',
    typescriptLint: 'Lint TypeScript to check for style and syntax errors.',
    watch: 'Start watching files for compilation and linting.',
    runDev: 'Start dev server and watch tasks.'
};

const CONFIG = {
    jsLib: [
        './assets/javascript/requestAnimationFramePolly.js',
        './assets/javascript/jquery.js',
        './assets/javascript/howler.js'
    ],
    tsSource: './app/**/*.ts',
    sassSrc: [
        './styles/**/*.scss'
    ]
};

gulp.task('lint.typescript', DOCS.typescriptLint, () => {
    return gulp.src(CONFIG.tsSource).pipe(tslint()).pipe(tslint.report('prose'));
});

gulp.task('build.typescript', DOCS.typescriptBuild, () => {
    let tsResult = gulp.src([CONFIG.tsSource, './typings/**/*.d.ts'])
                      .pipe(tsc({
                          typescript: require('typescript'),
                          target: 'ES5',
                          declarationFiles: false,
                          experimentalDecorators: true,
                          emitDecoratorMetadata: true,
                          module: 'system'
                      }));

    return tsResult.js
            .pipe(gulp.dest('./build/js/app'));
});

gulp.task('build.sass', DOCS.sassBuild, () => {
    return gulp.src(CONFIG.sassSrc)
        .pipe(sass({ outputStyle: 'compressed' }))
        .on('error', swallowError)
        .pipe(rename('app.min.css'))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('watch', () => {
    gulp.watch(CONFIG.sassSrc, ['build.sass']);
    gulp.watch(CONFIG.tsSource, ['build.typescript']); // 'lint.typescript', 
});

gulp.task('run.dev', DOCS.runDev, ['watch', 'build.typescript'], function () {
    let port = 9000, app;

    app = connect().use(serveStatic(__dirname));  // serve everything that is static

    http.createServer(app).listen(port, function () {
        open('http://localhost:' + port);
    });
});

gulp.task('clean', () => {
    del(['build/**/*']);
});

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}
