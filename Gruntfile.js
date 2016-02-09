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
            distDoc: './dist/doc',
            distApi: './dist',
            appDoc: './doc',
            appApi: './lib',
            bower: './bower_components',
            viewsApi: './views'
        },

        /*************************************************/
        /** TASK USED IN GRUNT SERVE                    **/
        /*************************************************/
        express: { // create a server to localhost
            dev: {
                options: {
                    bases: ['<%= project.build%>', '<%= project.appDoc%>', __dirname],
                    port: 9000,
                    hostname: "0.0.0.0",
                    livereload: true
                }
            },
            prod_check: {
                options: {
                    bases: [__dirname + '/<%= project.distDoc%>'],
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
                files: ['<%= project.appDoc%>/index.html', '<%= project.appDoc%>/scripts/**/*.js', '<%= project.appDoc%>/**/*.less', '<%= project.appDoc%>/views/**'],
                tasks: [
                    'less:dev',
                    'copy:dev',
                    'jshint:doc'
                ],
                options: {
                    livereload: true
                }
            },
            prod_check: {
                files: ['<%= project.distDoc%>/**'],
                options: {
                    livereload: true
                }
            }
        },

        /*************************************************/
        /** TASK USED BUILDING API                      **/
        /*************************************************/

        'file-creator': {
            api: {
                files: [
                    {
                        file: '<%= project.dist%>/package.json',
                        method: function (fs, fd, done) {
                            var packageJson = require('./package.json');
                            fs.writeSync(fd,
                                JSON.stringify({
                                    name: packageJson.name,
                                    description: 'Production',
                                    scripts: {
                                        start: packageJson.scripts.start
                                    },
                                    dependencies: packageJson.dependencies
                                }, null, 4)
                            );
                            done();
                        }
                    }
                ]
            }
        },

        auto_install: {
            local: {},
            api: {
              options: {
                cwd: '<%= project.dist%>',
                stdout: true,
                stderr: true,
                failOnError: true,
                npm: '--production'
              }
            }
          },

          /*************************************************/
          /** TASK USED BUILDING DOC                      **/
          /*************************************************/

        useminPrepare: {
            html: {
                src: ['<%= project.appDoc%>/index.html']
            },
            options: {
                dest: '<%= project.distDoc%>',
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
                '<%= project.distDoc%>/index.html'
            ],
            options: {
                assetsDirs: ['<%= project.distDoc%>']
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
                cwd: '<%= project.appDoc%>',
                src: 'views/**/*.html',
                dest: '<%= project.build%>/template.js',
                options: {
                    //prefix: '/',
                    usemin: '<%= project.distDoc%>/scripts/app.min.js',
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
                src: ['<%= project.appDoc%>/index.html'],
                ignorePath: /\.\.\//
            }
        },

        cssmin: {
            /*dist: {
                files: [
                    {
                        dest: '<%= project.distDoc%>/styles/styles.min.css',
                        src: ['<%= project.appDoc%>/styles/*.css', '<%= project.build%>/styles/*.css']
                    }
                ]
            }*/
        },

        filerev: { // change the name of files to avoid browser cache issue
            options: {
                algorithm: 'md5',
                length: 8
            },
            css: {
                src: '<%= project.distDoc%>/styles/*.css'
            },
            js: {
                src: '<%= project.distDoc%>/scripts/*.js'
            }
        },

        less: {
          dev: {
            options: {
              paths: ["<%= project.distDoc%>/styles"]
            },
            files: {
              "<%= project.build%>/styles/style.css": "<%= project.appDoc%>/**/*.less"
            }
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
                        apiUrl: 'http://localhost:8080',
                    }
                }
            },
            dist: {
                constants: {
                    appConfiguration: {
                        apiUrl: '/',
                    }
                }
            },
            build: {}
        },

        'json-minify': {
            build: {
                files: '<%= project.distDoc%>/data/**/*.json'
            }
        },


        /*************************************************/
        /** TASK USED BUILDING BOTH                     **/
        /*************************************************/

        copy: { // Copy files (images, ...)
            api: {
                files: [
                    {
                        expand: true,
                        flatten: false,
                        src: ['<%= project.appApi%>/**'],
                        dest: '<%= project.distApi%>/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['launcher.js'],
                        dest: '<%= project.distApi%>/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['config.json'],
                        dest: '<%= project.distApi%>/'
                    },
                    {
                        expand: true,
                        flatten: false,
                        src: ['<%= project.viewsApi%>/**/*.ejs'],
                        dest: '<%= project.distApi%>/'
                    }
                ]
            },
            dist: {
                files: [
                    { // Images for the styles
                        expand: true,
                        flatten: true,
                        src: ['<%= project.appDoc%>/styles/img/**'],
                        dest: '<%= project.distDoc%>/styles/img'
                    },
                    { // Images
                        expand: true,
                        flatten: true,
                        src: ['assets/**'],
                        dest: '<%= project.dist%>/assets'
                    },
                    { // glyphicon from bootstrap
                        expand: true,
                        flatten: true,
                        src: ['bower_components/bootstrap/fonts/*'],
                        filter: 'isFile',
                        dest: '<%= project.distDoc%>/fonts'
                    },
                    { // favico
                        expand: true,
                        flatten: true,
                        src: ['<%= project.appDoc%>/favicon.ico'],
                        dest: '<%= project.distDoc%>/',
                        filter: 'isFile'
                    }
                ],
            },
            html: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= project.appDoc%>/index.html'],
                        dest: '<%= project.distDoc%>/',
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
                        dest: '<%= project.distDoc%>/',
                        filter: 'isFile'
                    }
                ]
            },
            dev: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ['<%= project.appDoc%>/styles/img/**'],
                        dest: '<%= project.build%>/styles/img'
                    },
                ]
            }
        },

        jshint: {
            doc: [
                '<%= project.appDoc%>/scripts/**/*.js',
                'Gruntfile.js'
            ]
        },

        clean: { // erase all files in dist and build folder
            dist: ['<%= project.dist%>', '<%= project.build%>'],
            dev: ['<%= project.build%>']
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

    grunt.registerTask('dist-api', [
        'copy:api',
        'file-creator:api',
        'auto_install:api'
    ]);

    grunt.registerTask('dist-doc', [
        'jshint:doc',
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
        'usemin'
    ]);

    grunt.registerTask('default', [
        'clean:dist',
        'dist-api',
        'dist-doc'
    ]);
};
