global.__base = __dirname + '/';
var path = require('path');
var gulp = require('gulp');
var util = require ('gulp-util');
var excludeGitignore = require('gulp-exclude-gitignore');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var babel = require('gulp-babel');
var del = require('del');
var cucumber = require('gulp-cucumber');
var reporter = require('cucumber-html-reporter');

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-register');

gulp.task('static', function () {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore());
});

gulp.task('nsp', function (cb) {
  nsp({ package: path.resolve('package.json') }, cb);
});

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src('test/features/*').pipe(cucumber({
    'steps': '*features/steps/*.js',
    'support': '*features/support/*.js',
    'format': ['json:test/report/feature-report.json', 'pretty']
  })).pipe(istanbul.writeReports({
      dir: './report/unit-test-coverage',
      reports: ['html'],
      reportOpts: { dir: 'test/report/unit-test-coverage' }
    }))
});

gulp.task('report', ['test'], function () {
  var options = {
    theme: 'bootstrap',
    jsonFile: 'test/report/feature-report.json',
    output: 'test/report/cucumber_report.html',
    reportSuiteAsScenarios: true,
    launchReport: false
  };
  reporter.generate(options);
})


gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**'], ['test']);
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
  return del('dist');
});

gulp.on('stop', function () {
  process.nextTick(function () {
    process.exit(0);
  });
});

gulp.task('prepublish', ['nsp', 'babel']);
gulp.task('default', ['static', 'report']);

gulp.task('transform', function(){
  var env = util.env.environment
  var configPath = './test/features/config/'
  var configFile = 'config.json'
  var tranasforms = require(configPath + 'config.' + env + '.json')
  var config = require(configPath + configFile)
  
  for (var prop in config) {
    if (tranasforms.hasOwnProperty(prop)) { 
        config[prop] = tranasforms[prop]
    }
  }
  return newFile(configFile, JSON.stringify(config))
    .pipe(gulp.dest(configPath));
})

function newFile(name, contents) {
  //uses the node stream object
  var readableStream = require('stream').Readable({ objectMode: true })
  //reads in our contents string
  readableStream._read = function () {
    this.push(new util.File({ cwd: "", base: "", path: name, contents: new Buffer(contents) }))
    this.push(null)
  }
  return readableStream;
};