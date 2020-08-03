import gulp from 'gulp';
import config from '../';
import connect from 'gulp-connect';

gulp.task('js-copy', () => {
	return gulp.src(`${config.src}/js/*.js`)
		.pipe(gulp.dest(`${config.dist}/js`));
});

gulp.task('js-uikit', () => {
	return gulp.src(`${config.uikit}/js/*.min.js`)
		.pipe(gulp.dest(`${config.dist}/js`))
		.pipe(connect.reload());
});

gulp.task('js', gulp.series(
	'js-copy',
	'js-uikit'
));
