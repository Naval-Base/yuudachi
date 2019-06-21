const { task, watch, series, dest } = require('gulp');
const { emptyDir } = require('fs-nextra');
const { createProject } = require('gulp-typescript');
const { init, write } = require('gulp-sourcemaps');
const project = createProject('tsconfig.json');

async function clean() {
	await emptyDir('dist');
}

function scripts() {
	return project.src()
		.pipe(init())
		.pipe(project())
		.js
		.pipe(write())
		.pipe(dest('dist'));
}

async function build() {
	await clean();
	return scripts();
}

function watching() {
	watch('**/*.ts', scripts);
}

task('default', build);
task('build', build);
task('watch', series(scripts, watching));
