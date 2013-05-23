module.exports = (grunt) ->
  grunt.initConfig
    clean: ['lib']
    copy:
      main:
        files: [
          expand: true
          src: ['thirdparty/**']
          dest: 'lib'
        ]
    coffee:
      compile:
        expand: true 
        src: ['src/**/*.coffee', 'test/**/*.coffee', 'perf/**/*.coffee', 'coverage/**/*.coffee']
        dest: 'lib'
        ext: '.js'
    mochaTest:
      test:
        options: 
          reporter: 'spec'
          require: 'lib/coverage/blanket'
        src: ['lib/test/**/*.js']
      'html-cov':
        options: 
          reporter: 'html-cov'
          quiet: true
        src: ['lib/test/**/*.js']
        dest: 'coverage.html'
      'travis-cov':
        options:
          reporter: 'travis-cov'
        src: ['lib/test/**/*.js']

  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'

  grunt.registerTask 'default', [
    'clean'
    'copy'
    'coffee'
    'mochaTest'
  ]
