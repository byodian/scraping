const settings = {
  clean: true,
  scripts: true,
  copy: true,
  reload: true
}

const paths = {
  input: ['src/', 'public'],
  output: 'dist/',
  scripts: {
    input: 'src/js/**/*.js',
    output: 'dist/js'
  },
  copy: {
    input: ['public/*'],
    output: 'dist/'
  },
  reload: './dist'
}

const { src, dest, watch, series, parallel } = require('gulp');
const del = require('del');
const rename = require('gulp-rename');

// Scripts
const terser = require('gulp-terser');
const mode = require('gulp-mode')();
const babel = require('gulp-babel');
const webpack = require('webpack-stream'); 

const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');

const clean = function(cb) {
  if (!settings.clean) return cb();

  del.sync([
    paths.output
  ]);

  return cb();
}

const buildScripts = function(cb) {
  if(!settings.scripts) return cb();

  return src(paths.scripts.input)
    .pipe(babel())
    .pipe(webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe(mode.development(sourcemaps.init({ loadMaps: true})))
    .pipe(mode.development(rename('main.js')))
    .pipe(mode.production(terser({output: {comments: false}})))
    .pipe(mode.production(rename({
      basename: 'main',
      suffix: '.min'
    })))
    .pipe(mode.development( sourcemaps.write() ))
    .pipe(dest(paths.scripts.output))
}

const copyFiles = function (cb) {
	if (!settings.copy) return cb();

	return src(paths.copy.input)
		.pipe(dest(paths.copy.output));
};

const startServer = function(cb) {
	if (!settings.reload) return cb();
	browserSync.init({
		server: {
      baseDir: paths.reload,
		}
	});

	cb();
}

const reloadBrowser = function(cb) {
  if (!settings.reload) return cb();
  browserSync.reload();
  cb();
}

const watchSource = function(cb) {
  watch(paths.input, series(exports.default, reloadBrowser));
  cb();
}

/**
 * Exports Tasks
 */

exports.default = series(
  clean,
  parallel(
    buildScripts,
    copyFiles
  )
);

// Watch and reload
// gulp watch
exports.dev = series(
  exports.default,
  startServer,
  watchSource
);