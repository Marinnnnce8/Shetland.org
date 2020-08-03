import gulp from 'gulp';
import config from '../';
import connect from 'gulp-connect';

gulp.task('server', () => {

	connect.server({
		root: config.dist,
		livereload: true
	});

	return config.done();
});
