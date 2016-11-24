module.exports = function (grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: ['*.js', 'lib/*.js'],
                tasks: ['jshint']
            }
        },
        jshint: {
            all: ['gruntfile.js',
                '*.js',
                'lib/*.js',
            ],
            options: {
                jshintrc: '.jshintrc',
            }
        },
        nodemon: {
            dev: {
                script: '',
                options: {
                    args: [],
                    ignoredFiles: ['node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js'],
                    watchedFolders: ['*.js',
                        'lib/**',
                    ],
                    delayTime: 1,
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        env: {
            dev: {
                NODE_ENV: 'development'
            }
        }
    });

    //Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'env:dev', 'concurrent']);
};
