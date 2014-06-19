/*jshint newcap: false*/
module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var assert = require('assert');
	var webpack = require('webpack');

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-ts-clean');
	grunt.loadNpmTasks('grunt-webpack');

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
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
			source: ['src/**/*.ts']
		},
		clean: {
			dist: [
				'dist/**/*'
			],
			build: [
				'build/**/*'
			],
			demo: [
				'demo/js/pixelbutler*'
			],
			tmp: [
				'tmp/**/*'
			],
			cruft: [
				'tscommand-*.txt'
			],
			docs: [
				'docs/'
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
		copy: {
			pixelbutler: {
				files: [
					{expand: true, cwd: '.', src: ['README.md'], dest: 'demo/'}
				]
			}
		},
		'gh-pages': {
			options: {
				branch: 'gh-pages',
				base: 'demo'
			},
			publish: {
				options: {
					repo: 'https://github.com/pixelbutler/pixelbutler.git',
					message: 'publish gh-pages (cli)'
				},
				src: ['**/*']
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
				removeComments: true,
				sourceMap: true
			},
			index: {
				src: ['./src/index.ts'],
				outDir: './build'
			}
		},
		ts_clean: {
			build: {
				src: ['./build/**'],
				dot: true
			}
		},
		typedoc: {
			docs: {
				options: {
					name: pkg.name + ' - ' + pkg.description,
					module: 'commonjs',
					target: 'es5',
					out: './docs'
				},
				src: ['./src']
			}
		},
		webpack: {
			options: {
				progress: false,
				failOnError: true
			},
			demo: {
				entry: './build/index.js',
				devtool: 'source-map',
				module: {
					preLoaders: [
						{
							test: /\.js$/,
							loader: 'source-map-loader'
						}
					]
				},
				output: {
					library: 'pixelbutler',
					libraryTarget: 'umd',
					path: './demo/js/',
					sourceMapFilename: 'pixelbutler.js.map',
					filename: 'pixelbutler.js'
				}
			},
			dist: {
				entry: './build/index.js',
				output: {
					sourcePrefix: '    ',
					library: 'pixelbutler',
					libraryTarget: 'umd',
					path: './dist/',
					filename: 'pixelbutler.js'
				}
			},
			min: {
				entry: './build/index.js',
				plugins: [
					new webpack.optimize.UglifyJsPlugin()
				],
				output: {
					library: 'pixelbutler',
					libraryTarget: 'umd',
					path: './dist/',
					filename: 'pixelbutler.min.js'
				}
			}
		},
		verify: {
			demo: {
				list: [
					'./demo/js/pixelbutler.js'
				]
			},
			dist: {
				list: [
					'./dist/pixelbutler.js',
					'./dist/pixelbutler.min.js'
				]
			}
		}
	});

	// setup main aliases
	grunt.registerTask('default', ['build']);

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:build',
		'clean:demo'
	]);

	grunt.registerTask('compile', [
		'prep',
		'ts:index',
		'clean:cruft'
	]);

	grunt.registerTask('build', [
		'jshint:support',
		'compile',
		'tslint:source',
		'webpack:demo',
		'ts_clean:build',
		'webpack:dist',
		'webpack:min',
		'verify:demo',
		'verify:dist'
	]);

	grunt.registerTask('test', [
		'build'
		// more!
	]);

	grunt.registerTask('dev', [
		'compile',
		'webpack:demo',
		'verify:demo'
	]);

	grunt.registerTask('prepublish', [
		'build'
		// more!
	]);

	grunt.registerTask('server', [
		'connect:server'
	]);

	grunt.registerTask('onwatch', [
		'dev'
	]);

	grunt.registerTask('publish', 'Publish from CLI', [
		'prepublish',
		'gh-pages:publish'
	]);

	// check if we have all the important files
	grunt.registerMultiTask('verify', function () {
		var options = this.options({});
		var missing = [];

		function checkFile(file) {
			if (!grunt.file.exists(file)) {
				missing.push(file);
			}
			else {
				grunt.log.ok(file);
			}
		}

		// check dist files
		this.data.list.forEach(function (file) {
			checkFile(file);
		});

		if (missing.length > 0) {
			grunt.log.writeln('');
			missing.forEach(function (file) {
				grunt.log.error(file);
			});
			grunt.fail.warn('missing files');
		}
	});
};
