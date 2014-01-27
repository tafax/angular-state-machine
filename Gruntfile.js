/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Matteo Tafani Alunno <matteo.tafanialunno@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

module.exports = function(grunt)
{
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/**\n' +
                ' * <%= pkg.description %>\n' +
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                ' * @link <%= pkg.homepage %>\n' +
                ' * @author <%= pkg.author %>\n' +
                ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' +
                ' */\n'
        },
        dirs: {
            src: 'src',
            dest: 'dist'
        },
        bower: {
            install: {}
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>\n\n\'use strict\';\n\n',
                process: function(src, filepath) {
                    return '\n// Source: ' + filepath + '\n\n' +
                        src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                }
            },
            dist: {
                src: ['<%= dirs.src %>/**/*.js'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.dev.js'
            }
        },
        removelogging: {
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            dist: {
                src: ['<%= removelogging.dist.dest %>'],
                dest: '<%= dirs.dest %>/<%= pkg.name %>.min.js'
            }
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md'
            }
        },
        karma: {
            options: {
                configFile: 'karma.conf.js'
            },
            build: {
                singleRun: true,
                autoWatch: false
            },
            travis: {
                singleRun: true,
                autoWatch: false,
                browsers: ['Firefox']
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                createTag: false,
                commit: false,
                push: false
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "changelog" task.
    grunt.loadNpmTasks('grunt-conventional-changelog');

    // Load the plugin that provides the "bower" task.
    grunt.loadNpmTasks('grunt-bower-task');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Load the plugin that provides the "removelogging" task.
    grunt.loadNpmTasks('grunt-remove-logging');

    // Load the plugin that provides the "karma" task.
    grunt.loadNpmTasks('grunt-karma');

    // Load the plugin that provides the "bump" task.
    grunt.loadNpmTasks('grunt-bump');

    // Default task.
    grunt.registerTask('default', ['build']);

    // Test task.
    grunt.registerTask('test', ['karma:build']);

    // Travis task.
    grunt.registerTask('travis', ['bower', 'karma:travis']);

    // Build task.
    grunt.registerTask('build', ['test', 'concat', 'removelogging', 'uglify']);
};