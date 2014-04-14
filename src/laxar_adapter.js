/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint browser: true*/
/*global Jasmine1KarmaReporter, Jasmine2KarmaReporter*/
function createStartFn( karma, requirejs, jasmine, laxarSpec ) {
   'use strict';

   var jasmineEnv = jasmine.getEnv();
   
   if( jasmine.version_.major === 1 ) {
      jasmineEnv.addReporter( new Jasmine1KarmaReporter( karma, jasmineEnv ) );
   }
   else {
      jasmineEnv.addReporter( new Jasmine2KarmaReporter( karma, jasmineEnv ) );
   }

   return function() {
      requirejs.config( laxarSpec.requireConfig );
      requirejs( [
         'laxar/laxar_testing'
      ], function( ax ) {
         ax.testing.runSpec( laxarSpec, jasmineEnv );
      } );
   };
}
