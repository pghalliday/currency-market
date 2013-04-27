module.exports = (grunt) ->
  grunt.initConfig
    clean: ['lib']
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

  grunt.registerTask 'default', [
    'clean'
    'coffee'
    'mochaTest'
  ]
