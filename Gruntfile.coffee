module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      compile:
        expand: true 
        src: ['src/**/*.coffee', 'test/**/*.coffee']
        dest: 'lib'
        ext: '.js'
    mochaTest:
      files: ['lib/test/**/*.js']
    mochaTestConfig:
      options:
        reporter: 'spec'

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  
  grunt.registerTask 'default', [
    'coffee'
    'mochaTest'
  ]
