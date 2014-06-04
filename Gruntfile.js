/*jshint newcap: false*/
module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert = require('assert');

	var browserify = require('browserify');
	var exorcist = require('exorcist');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-ts');

	// list the files for reference (and verification)
	var dist = {
		basic: './dist/lorez.js'
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: grunt.file.readJSON('.jshintrc'),
			support: {
				src: ['Gruntfile.js', '*.js']
			}
		},
		tslint: {
			options: {
				configuration: grunt.file.readJSON('tslint.json'),
				formatter: 'tslint-path-formatter'
			},
			src: ['src/**/*.ts']
		},
		clean: {
			dist: [
				'dist/**/*'
			],
			build: [
				'build/**/*'
			],
			tmp: [
				'tmp/**/*'
			]
		},
		connect: {
			options: {
				port: 8080,
				hostname: '0.0.0.0',
				base: '.'
			},
			server: {
				options: {
					keepalive: true
				}
			}
		},
		watch: {
			all: {
				options: {
					atBegin: true
				},
				files: ['src/**/*.ts'],
				tasks: ['onwatch']
			}
		},
		ts: {
			options: {
				fast: 'never',
				target: 'es5',
				module: 'commonjs',
				sourceMap: true
			},
			index: {
				src: ['./src/index.ts'],
				outDir: './build'
			}
		},
		bundle: {
			options: {
				standalone: 'lorez'
			},
			index: {
				main: './build/index.js',
				bundle: dist.basic
			}
		}
	});

	// setup main aliases
	grunt.registerTask('default', ['build']);

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:build',
		'jshint:support'
	]);

	grunt.registerTask('build', [
		'prep',
		'ts:index',
		// 'tslint:src',
		'bundle:index',
		// 'verify'
	]);

	grunt.registerTask('test', [
		'build',
		'tslint:src',
		'verify'
		// more!
	]);

	grunt.registerTask('server', [
		'connect:server',
	]);

	grunt.registerTask('onwatch', [
		'build'
	]);

	// for development and demos
	grunt.registerTask('dev', [
		'prep',
		'bundle:suite'
	]);

	// check if we have all the important files
	grunt.registerTask('verify', function () {
		var missing = [];

		function checkFile(file) {
			if (!grunt.file.exists(file)) {
				missing.push(file);
			}
			else {
				grunt.log.ok(file);
			}
		}

		// check package.json main file
		checkFile(grunt.config.get('pkg.main'));

		// check dist files
		Object.keys(dist).forEach(function (key) {
			checkFile(dist[key]);
		});

		if (missing.length > 0) {
			grunt.log.writeln('');
			missing.forEach(function (file) {
				grunt.log.error(file);
			});
			grunt.fail.warn('missing files');
		}
	});

	// custom browserify multi-task
	grunt.registerMultiTask('bundle', function () {
		var options = this.options({
			// name of the UMD global
			standalone: 'lorez'
		});
		// always source-map (minifyify expects this)
		options.debug = true;

		var done = this.async();

		var mainFile = this.data.main;
		var bundleFile = this.data.bundle;
		var mapFile = bundleFile + '.map';

		// make sure we have the directory (fs-stream is naive)
		grunt.file.mkdir(path.dirname(bundleFile));

		//setup stream
		var bundle = new browserify();
		bundle.add(mainFile);

		var stream = bundle.bundle(options, function (err) {
			if (err) {
				grunt.log.error(mainFile);
				console.log(err);
				done(false);
			}
			else {
				grunt.log.writeln('>> '.white + mainFile);
				grunt.log.ok(bundleFile);
				done();
			}
		});
		// split source-map to own file
		stream = stream.pipe(exorcist(mapFile));
		stream.pipe(fs.createWriteStream(bundleFile));
	});

};
