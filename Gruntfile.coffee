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
        src: ['src/**/*.coffee', 'test/**/*.coffee', 'perf/**/*.coffee']
        dest: 'lib'
        ext: '.js'
    mochaTest:
      files: ['lib/test/**/*.js']
    mochaTestConfig:
      options:
        reporter: 'spec'

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask 'default', [
    'clean'
    'copy'
    'coffee'
    'mochaTest'
  ]
