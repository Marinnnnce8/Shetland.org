import gulp from 'gulp';
import config from '../';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import flexBugsFix from 'postcss-flexbugs-fixes';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import rename from 'gulp-rename';
import connect from 'gulp-connect';

// Compile SCSS files
gulp.task('scss', () => {

	const processors = [
		autoprefixer(),
		flexBugsFix
	];

	return gulp.src([`${config.src}/scss/*.scss`])
		.pipe(plumber({
			errorHandler: notify.onError({
				title: 'There was some Error, I think...',
				message: 'Error message: <%= error.message %>'
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: config.productionBuild ? 'compressed' : 'expanded'
		}))
		.pipe(postcss(processors))
		.pipe(rename('theme.min.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${config.dist}/css`))
		.pipe(connect.reload());
});

// Copy CSS UIkit files
gulp.task('css-uikit', () => {
	return gulp.src(`${config.uikit}/css/uikit.min.css`)
		.pipe(gulp.dest(`${config.dist}/css`));
});

// Copy additional CSS files (e.g. plugin css files)
gulp.task('css-copy', () => {
	return gulp.src(`${config.src}/css/*.css`)
		.pipe(gulp.dest(`${config.dist}/css`));
});

// Sass Lint
gulp.task('sasslint', () => {
	return gulp.src(['src/scss/**/*.scss', 'src/html/**/**/*.scss'])
		.pipe(sassLint({
			config: '.sass-lint.yml'
		}))
		.pipe(sassLint.format())
		.pipe(sassLint.failOnError());
});

gulp.task('css', gulp.series(
	'scss',
	'css-copy',
	'css-uikit'
));
