/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint browser: true*/
/*global Jasmine1KarmaReporter, Jasmine2KarmaReporter*/
function createStartFn( karma, requirejs, jasmineRequireOrJasmine, laxarSpec ) {
   'use strict';

   var jasmine;
   var jasmineEnv;
   if( typeof jasmineRequireOrJasmine.version === 'function' &&
       jasmineRequireOrJasmine.version().indexOf( '2.' ) === 0 ) {
      // We have jasmine version 2.x.x and thus assume widget tests running with LaxarJS/laxar-testing
      // instead of the old LaxarJs/laxar/laxar_testing.
      var jasmineRequire = jasmineRequireOrJasmine;
      // We need to expose jasmine on the global object for angular-mocks
      jasmine = window.jasmine = jasmineRequire.core( jasmineRequire );
      jasmineEnv = jasmine.getEnv();

      jasmineEnv.addReporter( new Jasmine2KarmaReporter( karma, jasmineEnv ) );

      var jasmineInterface = jasmineRequire.interface(jasmine, jasmineEnv);
      for( var property in jasmineInterface ) {
         if( jasmineInterface.hasOwnProperty( property ) ) {
            window[property] = jasmineInterface[property];
         }
      }

      return function() {
         requirejs.config( laxarSpec.requireConfig );
         requirejs( [
            'laxar-testing'
         ], function( testing ) {
            testing.runSpec( laxarSpec, jasmineEnv );
         } );
      };
   }

   jasmine = window.jasmine = jasmineRequireOrJasmine;
   // We have jasmine version 1.x.x and hence assume old style laxar_testing
   jasmineEnv = jasmine.getEnv();

   jasmineEnv.addReporter( new Jasmine1KarmaReporter( karma, jasmineEnv ) );

   return function() {
      requirejs.config( laxarSpec.requireConfig );
      requirejs( [
         'laxar/laxar_testing'
      ], function( ax ) {
         ax.testing.runSpec( laxarSpec, jasmineEnv );
      } );
   };
}
