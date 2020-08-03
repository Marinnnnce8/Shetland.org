import gulp from 'gulp';
import config from '../';

gulp.task('watch', () => {

	// SCSS
	gulp.watch(`${config.src}/scss/**/*.scss`, gulp.series('css', 'sasslint'));

	// JS
	gulp.watch(`${config.src}/js/**/*.js`, gulp.series('js'));

	// HTML
	gulp.watch(`${config.src}/*.html`, gulp.series('html'));

	return config.done();
});
