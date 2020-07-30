const gulp = require("gulp");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify-es").default;
const rename = require("gulp-rename");
const runSequence = require("run-sequence");
const eslint = require("gulp-eslint");
const webpack = require("gulp-webpack");
const webpackConfig = require("../../../webpack.config");
const gulpif = require("gulp-if");
const globalVars = require("./_global-vars");

const destinationFolder = "dist/js";

/*----------------------------------------------------------------------------------------------
	JS
 ----------------------------------------------------------------------------------------------*/
gulp.task('js-copy', function(){
    return gulp.src('src/js/*.js')
	.pipe(gulp.dest(destinationFolder));
});

gulp.task("js", function() {
	runSequence("js-copy", () => false);
});
