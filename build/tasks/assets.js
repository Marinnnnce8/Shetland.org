import gulp from 'gulp';
import config from '../';
import fs from 'fs';
import imagemin from 'gulp-imagemin';

gulp.task('assets-img', () => {
	return gulp.src(`${config.src}/img/*`)
		.pipe(imagemin([
			imagemin.svgo({
				plugins: [
					{removeViewBox: false}
				]
			})
		]))
		.pipe(gulp.dest(`${config.dist}/img`));
});

gulp.task('assets-fonts', () => {

	const dist = `${config.dist}/fonts`;
	const src = `${config.src}/fonts`;
	const distAssets = fs.existsSync(dist)
		? fs.readdirSync(dist)
		: [];

	if (!fs.existsSync(dist)) {
		fs.mkdirSync(`./${dist}`);
	}

	if (fs.existsSync(src)) {
		fs.readdirSync(src).forEach(cur => {
			if (!distAssets.includes(cur)) {
				fs.copyFileSync(`${src}/${cur}`, `${dist}/${cur}`);
			}
		});
	}

	return config.done();
});

gulp.task('assets-favicons', () => {
	return gulp.src(`${config.src}/favicon/**`).pipe(gulp.dest(`${config.dist}/favicon`));
});

gulp.task('assets', gulp.series(
	'assets-img',
	'assets-fonts',
	'assets-favicons'
));
