/*jshint newcap: false*/
module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var assert = require('assert');

    var browserify = require('browserify');
    var minifyify = require('minifyify');
    var exorcist = require('exorcist');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // list the files for reference (and verification)
    var dist = {
        basic: './dist/fb.js',
        // basic_min: './dist/fb.min.js',
        suite: './dist/suite.js',
        // suite_min: './dist/suite.min.js'
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: grunt.file.readJSON('.jshintrc'),
            support: {
                src: ['Gruntfile.js', '*.js']
            },
            lib: {
                src: ['lib/**/*.js']
            }
        },
        clean: {
            dist: [
                'dist/**/*'
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
                files: ['lib/**/*.js'],
                tasks: ['onwatch']
            }
        },
        bundle: {
            options: {
            },
            basic: {
                main: './lib/basic.js',
                bundle: dist.basic
            },
            suite: {
                main: './lib/suite.js',
                bundle: dist.suite
            },
            basic_min: {
                options: {
                    minify: true
                },
                main: './lib/basic.js',
                bundle: dist.basic_min
            },
            suite_min: {
                options: {
                    minify: true
                },
                main: './lib/suite.js',
                bundle: dist.suite_min
            }
        }
    });

    // setup main aliases
    grunt.registerTask('default', ['build']);

    grunt.registerTask('prep', [
        'clean:tmp',
        'clean:dist',
        'jshint:support',
        'jshint:lib'
    ]);

    grunt.registerTask('build', [
        'prep',
        'bundle:basic',
        'bundle:suite',
        //'bundle:basic_min',
        //'bundle:suite_min',
        'verify'
    ]);

    grunt.registerTask('test', [
        'build'
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
        Object.keys(dist).forEach(function(key) {
            checkFile(dist[key]);
        });

        if(missing.length > 0) {
            grunt.log.writeln('');
            missing.forEach(function(file) {
                grunt.log.error(file);
            });
            grunt.fail.warn('missing files');
        }
    });

    // custom browserify multi-task
    grunt.registerMultiTask('bundle', function () {
        var options = this.options({
            // name of the UMD global
            standalone: 'Framebuffer',
            minify: false
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

        // TODO minify seems to work except when it doesnt.. weird (fix later)
        if (options.minify) {
            // minify and split sourcemap to own file
            stream.pipe(minifyify({
                map: path.basename(mapFile)
            }, function (err, src, map) {
                assert.ifError(err);
                grunt.file.write(mapFile, map);
                grunt.file.write(bundleFile, src);
            }));
        }
        else {
            // split source-map to own file
            stream = stream.pipe(exorcist(mapFile));
            stream.pipe(fs.createWriteStream(bundleFile));
        }
    });

};
