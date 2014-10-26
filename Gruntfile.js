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
	grunt.loadNpmTasks('grunt-dts-bundle');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-ts');
	grunt.loadNpmTasks('grunt-ts-clean');
	grunt.loadNpmTasks('grunt-webpack');
	grunt.loadNpmTasks('grunt-mocha-slimer');

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
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
			source: ['src/**/*.ts'],
			test: ['test/src/**/*.ts']
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
			test: [
				'test/tmp/**/*',
				'test/dist/**/*',
				'test/build/**/*'
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
				hostname: '0.0.0.0',
				base: '.'
			},
			server: {
				options: {
					port: 8080,
					keepalive: true
				}
			},
			test: {
				options: {
					port: 8081,
					keepalive: false
				}
			}
		},
		copy: {
			demo: {
				files: [
					{expand: true, cwd: '.', src: ['README.md'], dest: 'demo/'},
					{expand: true, cwd: 'dist', src: ['pixelbutler.debug.*'], dest: 'demo/js/', filter: 'isFile', rename: function (dest, src) {
						return path.join(dest, src.replace('.debug', ''));
					}}
				]
			},
			def: {
				src: 'build/pixelbutler.d.ts',
				dest: 'dist/pixelbutler.d.ts'
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
				options: {
					declaration: true
				},
				src: ['./src/index.ts'],
				outDir: './build'
			},
			test: {
				src: ['./test/src/**/*.ts'],
				outDir: './test/build'
			}
		},
		ts_clean: {
			build: {
				src: ['./build/**', '!./build/pixelbutler.d.ts'],
				dot: true
			}
		},
		dts_bundle: {
			index: {
				options: {
					removeTypings: true,
					name: 'pixelbutler',
					main: 'build/index.d.ts'
				}
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
			debug: {
				devtool: 'source-map',
				module: {
					preLoaders: [
						{
							test: /\.js$/,
							loader: 'source-map-loader'
						}
					]
				},
				entry: './build/index.js',
				output: {
					sourcePrefix: '    ',
					library: 'pixelbutler',
					libraryTarget: 'umd',
					path: './dist/',
					filename: 'pixelbutler.debug.js'
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
			},
			test: {
				entry: ['./test/build/index.js'],
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
					library: 'tests',
					libraryTarget: 'umd',
					sourcePrefix: '    ',
					path: './test/dist',
					filename: 'bundle.js'
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
					'./dist/pixelbutler.d.ts',
					'./dist/pixelbutler.min.js',
				]
			},
			build: {
				list: [
					'./build/index.js',
					'./build/pixelbutler.d.ts'
				]
			}
		},
		mocha_slimer: {
			options: {
				reporter: 'mocha-unfunk-reporter',
				timeout: 8000,
				xvfb: (process.env.TRAVIS === 'true'),
				run: true
			},
			test: {
				options: {
					urls: ['http://localhost:8081/test/index.html']
				}
			}
		}
	});

	// setup main aliases
	grunt.registerTask('default', ['build']);

	grunt.registerTask('lint', [
		'jshint',
		'tslint'
	]);

	grunt.registerTask('prep', [
		'clean:tmp',
		'clean:dist',
		'clean:build',
		'clean:test',
		'clean:demo'
	]);

	grunt.registerTask('compile', [
		'prep',
		'ts:index',
		'dts_bundle:index',
		'clean:cruft'
	]);

	grunt.registerTask('build', [
		'jshint:support',
		'compile',
		'tslint:source',
		'webpack:debug',
		'ts_clean:build',
		'webpack:dist',
		'webpack:min',
		'copy:demo',
		'copy:def',
		'verify:demo',
		'verify:build',
		'verify:dist'
	]);

	grunt.registerTask('runtest', [
		'ts:test',
		'tslint:test',
		'webpack:test',
		'connect:test',
		'mocha_slimer:test'
	]);

	grunt.registerTask('test', [
		'build',
		'runtest',
		// more!
	]);

	grunt.registerTask('run', [
		'runtest'
	]);

	grunt.registerTask('dev', [
		'connect:test',
		'mocha_slimer:test'
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
