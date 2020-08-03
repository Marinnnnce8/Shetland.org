import gulp from 'gulp';
import config from '../';
import clean from 'gulp-clean';
import connect from 'gulp-connect';

// Delete all HTML files from dist
gulp.task('html-clean', () => {
	return gulp.src(`${config.dist}/**/*.html`, {read: false})
		.pipe(clean());
});

// Copy all src HTML files to dist
gulp.task('html', () => {
	return gulp.src(`${config.src}/**/*.html`)
		.pipe(gulp.dest(config.dist))
		.pipe(connect.reload());
});
