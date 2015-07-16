/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint browser: true*/
(function( karma, laxarSpec, require ) {
   'use strict';

   var baseUrl = require.baseUrl || '';
   var karmaRoot = '/base/';
   var specPattern = new RegExp( '^' + karmaRoot + '(.*)/spec_runner\\.js$' );

   for( var file in karma.files ) {
      if( karma.files.hasOwnProperty( file ) ) {
         var match = specPattern.exec( file );

         if( match ) {
            laxarSpec.specUrl = karmaRoot + match[1];
            break;
         }
      }
   }

   (laxarSpec.requireConfig = laxarSpec.requireConfig || {} ).baseUrl = karmaRoot + baseUrl;
   require.baseUrl = karmaRoot + baseUrl;

})( window.__karma__, window.laxarSpec, require );
