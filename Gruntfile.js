/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( grunt ) {
   'use strict';

   var pkg = grunt.file.readJSON( 'package.json' );

   grunt.initConfig({
      concat: {
         adapter: {
            files: {
               'lib/adapter_post.js': [
                  'src/wrap.pre',
                  'src/util.js',
                  'src/requirejs_adapter.js',
                  'src/jasmine1_adapter.js',
                  'src/jasmine2_adapter.js',
                  'src/laxar_adapter.js',
                  'src/wrap.post'
               ]
            }
         }
      },
      uglify: {
         adapter: {
            files: {
               'lib/adapter_pre.min.js': [ 'lib/adapter_pre.js' ],
               'lib/adapter_post.min.js': [ 'lib/adapter_post.js' ]
            }
         }
      },
      jshint: {
         options: {
            jshintrc: '.jshintrc'
         },
         gruntfile: {
            options: { node: true },
            src: 'Gruntfile.js'
         },
         plugin: {
            src: [
               'src/laxar_adapter.js',
               'lib/adapter_pre.js',
               'lib/index.js'
            ]
         }
      },
      'npm-publish': {
         options: {
            requires: [ 'test' ]
         }
      },
      'npm-contributors': {
         options: {
            commitMessage: 'update contributors'
         }
      },
      bump: {
         options: {
            commitMessage: 'release v%VERSION%',
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            pushTo: 'origin'
         }
      }
   });

   grunt.loadNpmTasks( 'grunt-contrib-concat' );
   grunt.loadNpmTasks( 'grunt-contrib-uglify' );
   grunt.loadNpmTasks( 'grunt-contrib-jshint' );
   grunt.loadNpmTasks( 'grunt-bump' );
   grunt.loadNpmTasks( 'grunt-npm' );
   grunt.loadNpmTasks( 'grunt-auto-release' );

   grunt.registerTask( 'test', ['jshint'] );
   grunt.registerTask( 'build', ['concat', 'uglify'] );
   grunt.registerTask( 'default', ['build', 'test'] );

   grunt.registerTask( 'release', 'Test, bump and publish to NPM.', function( type ) {
      grunt.task.run( [
         'test',
         'npm-contributors',
         'bump-only:#{type || \'patch\'}',
         'build',
         'bump-commit',
      // 'npm-publish'
      ] );
   } );
};
