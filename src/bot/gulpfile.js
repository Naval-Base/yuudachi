const gulp = require('gulp');
const fsn = require('fs-nextra');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const project = ts.createProject('tsconfig.json');

async function build() {
	await fsn.emptydir('dist');

	const result = project.src()
		.pipe(sourcemaps.init())
		.pipe(project());

	return result.js.pipe(sourcemaps.write('.', { sourceRoot: '.' })).pipe(gulp.dest('dist'));
}

gulp.task('default', build);
gulp.task('build', build);
