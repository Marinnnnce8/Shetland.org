import gulp from 'gulp';
import config from './build';
import fs from 'fs';
import requireDir from 'require-dir';
import clean from 'gulp-clean';

requireDir('./build/tasks');

gulp.task('production', () => {
	config.production = true;
	return config.done();
});

gulp.task('create-dist', () => {
	if (!fs.existsSync(config.dist)) {
		fs.mkdirSync(`./${config.dist}`);
	}
	if (!fs.existsSync(`${config.dist}/img`)) {
		fs.mkdirSync(`./${config.dist}/img`);
	}
	return config.done();
});

gulp.task('build-all', gulp.series(
	'create-dist',
	//'html-clean',
	'html',
	'css',
	'js',
	// 'iconfont',
	'svgSprite',
	'assets'
));

gulp.task('build', gulp.series(
	'production',
	'build-all',
));

gulp.task('build-dev', gulp.series(
	'build-all',
));

gulp.task('dev', gulp.series(
	'build-all',
	'assets',
	'watch'
));

gulp.task('reset', () => {
	return gulp.src(config.dist, {read: false})
		.pipe(clean());
});
