import gulp from 'gulp';
import config from '../';
import imagemin from 'gulp-imagemin';
import svgSprite from 'gulp-svg-sprite';

// Icons
gulp.task('svgSprite', () => {
	return gulp.src(`${config.src}/icons/*.svg`)
	.pipe(imagemin([ // @todo can settings be improved?
		imagemin.svgo({
			plugins: [
				{removeViewBox: false}
			]
		})
	]))
	.pipe(svgSprite({
		mode: {
			symbol: {
				sprite: 'icons.svg'
			}
		}
	}))
	.pipe(gulp.dest(`${config.dist}/`));
});
