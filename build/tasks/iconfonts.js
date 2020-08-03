import gulp from 'gulp';
import config from '../';
import iconfont from 'gulp-iconfont';
import iconfontCss from 'gulp-iconfont-css';

// IconFont
gulp.task('iconfont', () => {
	return gulp.src([`${config.src}/svg/*.svg`])
		.pipe(iconfontCss({
			fontName: 'svgicons',
			cssClass: 'font',
			path: 'build/icon-font.scss',
			targetPath: `../../${config.src}/scss/layout/_icon-font.scss`,
			fontPath: `../fonts/`
		}))
		.pipe(iconfont({
			fontName: 'svgicons', // required
			prependUnicode: false, // recommended option
			formats: ['ttf', 'woff', 'woff2'], // default, 'woff2' and 'svg' are available
			normalize: true,
			centerHorizontally: true
		}))
		.on('glyphs', (glyphs, options) => {
			// CSS templating, e.g.
			console.log(glyphs, options);
		})
		.pipe(gulp.dest(`${config.src}/fonts/`));
});
