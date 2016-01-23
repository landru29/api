/*jslint nomen: true*/
/*global require, module,  __dirname */

module.exports = function (grunt) {
    'use strict';

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure Grunt
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        project: {
            build: './build',
            dist: './dist',
            app: './doc',
            bower: './bower_components'
        },

        /*************************************************/
        /** TASK USED IN GRUNT SERVE                    **/
        /*************************************************/
        express: { // create a server to localhost
            dev: {
                options: {
                    bases: ['<%= project.build%>', '<%= project.app%>', __dirname],
                    port: 9000,
                    hostname: "0.0.0.0",
                    livereload: true
                }
            },
            prod_check: {
                options: {
                    bases: [__dirname + '/<%= project.dist%>'],
                    port: 3000,
                    hostname: "0.0.0.0",
                    livereload: true
                }
            }
        },

        open: { // open application in Chrome
            dev: {
                path: 'http://localhost:<%= express.dev.options.port%>'
            },
            prod_check: {
                path: 'http://localhost:<%= express.prod_check.options.port%>'
            }
        },

        watch: { // watch files, trigger actions and perform livereload
            dev: {
                files: ['<%= project.app%>/index.html', '<%= project.app%>/scripts/**/*.js', '<%= project.app%>/**/*.less', '<%= project.app%>/views/**'],
                tasks: [
                    'less:dev',
                    'copy:dev',
                    'jshint'
                ],
                options: {
                    livereload: true
                }
            },
            prod_check: {
                files: ['<%= project.dist%>/**'],
                options: {
                    livereload: true
                }
            }
        },

        jshint: {
            dev: [
                '<%= project.app%>/scripts/**/*.js',
                'Gruntfile.js'
            ]
        },

        /*************************************************/
        /** TASK USED BUILDING                          **/
        /*************************************************/


        useminPrepare: {
            html: {
                src: ['<%= project.app%>/index.html']
            },
            options: {
                dest: '<%= project.dist%>',
                staging: '<%= project.build%>',
                root: 'src',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        usemin: {
            html: [
                '<%= project.dist%>/index.html'
            ],
            options: {
                assetsDirs: ['<%= project.dist%>']
            }
        },

        concat: { // concatenate JS files in one
            generated: {
            },
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            }

        },

        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [
                    {
                        expand: true,
                        src: ['<%= project.build%>/concat/**/*.js']
                    }
                ]
            }
        },

        ngtemplates: {
            Documentation: {
                cwd: '<%= project.app%>',
                src: 'views/**/*.html',
                dest: '<%= project.build%>/template.js',
                options: {
                    //prefix: '/',
                    usemin: '<%= project.dist%>/scripts/app.min.js',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true, // Only if you don't use comment directives!
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            }
        },

        wiredep: { // Inject bower components in index.html
            app: {
                src: ['<%= project.app%>/index.html'],
                ignorePath: /\.\.\//
            }
        },

        cssmin: {
            /*dist: {
                files: [
                    {
                        dest: '<%= project.dist%>/styles/styles.min.css',
                        src: ['<%= project.app%>/styles/*.css', '<%= project.build%>/styles/*.css']
                    }
                ]
            }*/
        },

        clean: { // erase all files in dist and build folder
            dist: ['<%= project.dist%>', '<%= project.build%>'],
            dev: ['<%= project.build%>']
        },

        filerev: { // change the name of files to avoid browser cache issue
            options: {
                algorithm: 'md5',
                length: 8
            },
            css: {
                src: '<%= project.dist%>/styles/*.css'
            },
            js: {
                src: '<%= project.dist%>/scripts/*.js'
            }
        },

        less: {
          dev: {
            options: {
              paths: ["<%= project.dist%>/styles"]
            },
            files: {
              "<%= project.build%>/styles/style.css": "<%= project.app%>/**/*.less"
            }
          }
        },

        copy: { // Copy files (images, ...)
            dist: {
                files: [
                    { // Images for the styles
                        expand: true,
                        flatten: true,
                        src: ['<%= project.app%>/styles/img/**'],
                        dest: '<%= project.dist%>/styles/img'
                    },
                    { // glyphicon from bootstrap
                        expand: true,
                        flatten: true,
                        src: ['bower_components/bootstrap/fonts/*'],
                        filter: 'isFile',
                        dest: '<%= project.dist%>/fonts'
                    },
                    { // favico
                        expand: true,
                        flatten: true,
                        src: ['<%= project.app%>/favicon.ico'],
                        dest: '<%= project.dist%>/',
                        filter: 'isFile'
                    }
                ],
            },
            html: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= project.app%>/index.html'],
                        dest: '<%= project.dist%>/',
                        filter: 'isFile'
                    }
                ]
            },
            conf: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        cwd: '<%= project.build%>',
                        src: ['scripts/**/*.js'],
                        dest: '<%= project.dist%>/',
                        filter: 'isFile'
                    }
                ]
            },
            dev: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= project.app%>/styles/img/**'],
                        dest: '<%= project.build%>/styles/img'
                    },
                ]
            }
        },

        'json-minify': {
            build: {
                files: '<%= project.dist%>/data/**/*.json'
            }
        },

        compress: {
            main: {
                options: {
                    archive: 'dist.tgz'
                },
                files: [
                    {
                        src: ['<%= project.dist%>/**'],
                        expand: true,
                        dest: '.'
                    }
                ]
            }
        },

        ngconstant: {
            options: {
                name: 'doc.config',
                dest: '<%= project.build%>/scripts/config.js',

            },
            dev: {
                constants: {
                    appConfiguration: {
                        apiUrl: 'http://localhost:8080/api',
                        loginUrl: 'http://localhost:8080/login'
                    }
                }
            },
            dist: {
                constants: {
                    appConfiguration: {
                        apiUrl: '/api',
                        loginUrl: '/login'
                    }
                }
            },
            build: {}
        }
    });

    grunt.registerTask('serve', [
        'clean:dev',
        'ngconstant:dev',
        'wiredep',
        'less:dev',
        'copy:dev',
        'express:dev',
        'open:dev',
        'watch:dev'
    ]);

    grunt.registerTask('prod', [
        'jshint',
        'clean:dist',
        'ngconstant:dist',
        'wiredep',
        'useminPrepare',
        'ngtemplates',
        'concat:generated',
        'ngAnnotate',
        'less:dev',
        'cssmin',
        'uglify',
        'copy',
        'filerev:js',
        'filerev:css',
        'usemin',
        'compress'
    ]);

    grunt.registerTask('default', ['prod']);
};
