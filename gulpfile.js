var path = require('path');
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var spawn = require('child_process').spawn;
var node, env = process.env;

// --------------------- Build CSS --------------------- //
gulp.task('build-sass', function () {
	gulp.src(path.join(__dirname, '/scss/*.scss'))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.join(__dirname, '/scss/temp')))			//build them here first
		.pipe(concat('main.css'))										//concat them all
		//.pipe(gulp.dest(path.join(__dirname, '/public/css')))
		.pipe(cleanCSS())												//minify
		.pipe(rename('main.min.css'))
		.pipe(gulp.dest(path.join(__dirname, '/public/css')));			//dump it here
});

// -------------------- Run Parts -------------------- //
gulp.task('server', function (a, b) {
	if (node) node.kill();
	node = spawn('node', ['server.js'], { env: env, stdio: 'inherit' });	//command, file, options
});

// -------------- Watch for File Changes --------------- //
gulp.task('watch-sass', ['build-sass'], function () {
	gulp.watch(path.join(__dirname, '/scss/*.scss'), ['build-sass']);
});
gulp.task('watch-server', function () {
	gulp.watch(path.join(__dirname, '/routes/**/*.js'), ['server']);
	gulp.watch([path.join(__dirname, '/utils/fc_wrangler/*.js')], ['server']);
	gulp.watch([path.join(__dirname, '/utils/*.js')], ['server']);
	gulp.watch(path.join(__dirname, '/server.js'), ['server']);
});


// ---------------- Runnable Gulp Tasks ---------------- //
gulp.task('default', ['watch-sass', 'watch-server', 'server']);
gulp.task('parts_tls', ['env_tls', 'watch-sass', 'watch-server', 'server']);		//run with command `gulp parts_tls` for bluemix blockchain service
gulp.task('parts_local', ['env_local', 'watch-sass', 'watch-server', 'server']);	//run with command `gulp parts_local` for a local network
gulp.task('parts_cs', ['env_cs', 'watch-sass', 'watch-server', 'server']);		//run with command `gulp parts_cs` for bluemix container service
gulp.task('parts_dev', ['env_dev', 'watch-sass', 'watch-server', 'server']);		//run with command `gulp parts_dev` if you are me
gulp.task('parts_dev2', ['env_dev2', 'watch-sass', 'watch-server', 'server']);	//run with command `gulp parts_dev` if you are me
gulp.task('build', ['watch-sass']);

// Bluemix IBM Blockchain Service
gulp.task('env_tls', function () {
	env['creds_filename'] = 'parts_tls.json';
});

// Local Fabric via Docker Compose
gulp.task('env_local', function () {
	env['creds_filename'] = 'parts_local.json';
});

// Bluemix Container Service
gulp.task('env_cs', function () {
	env['creds_filename'] = 'parts_cs.json';
});

// Dev
gulp.task('env_dev', function () {
	env['creds_filename'] = 'parts_dev.json';
});

// Dev 2
gulp.task('env_dev2', function () {
	env['creds_filename'] = 'parts_dev2.json';
});