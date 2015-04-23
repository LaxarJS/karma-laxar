/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
var fs = require( 'fs' );
var path = require( 'path' );

function createPattern( file ) {
   'use strict';
   return {
      pattern: file,
      included: true,
      served: true,
      watched: false
   };
}

/**
 * Evaluate the require_config.js file and return the configuration.
 */
function readRequireConfig( file ) {
   'use strict';
   var config = fs.readFileSync( file );

   /*jshint -W054*/
   var evaluate = new Function( 'var window = this;' + config + '; return require || window.require;' );

   return evaluate.call({});
}

/**
 * Inject frameworks and configuration into the files list in
 * the one order that works:
 *
 *    - require_config.js
 *    - spec_runner.js
 *    - adapter_pre.js (adjusts require.baseUrl)
 *    - jasmine (as specified by require config)
 *    - requirejs (as specified by require config)
 *    - adapter_post.js (adapter jasmine, requirejs, runs tests)
 *    - (all other files)
 */
function initLaxar( config ) {
   'use strict';
   var files = config.files;
   var laxar = config.laxar || {};

   if( !laxar.specRunner ) {
      throw new Error( 'Missing laxar.specRunner in Karma configuration!' );
   }
   if( !laxar.requireConfig ) {
      throw new Error( 'Missing laxar.requireConfig in Karma configuration!' );
   }

   var specRunner = path.resolve( laxar.specRunner );
   var requireConfig = path.resolve( laxar.requireConfig );
   var rconfig = readRequireConfig( requireConfig );
   var baseUrl = path.resolve( path.join( config.basePath, rconfig.baseUrl ) );

   config.preprocessors[ '**/*.html' ] = '';

   files.unshift.apply( files, [
      requireConfig,
      specRunner,
      require.resolve( 'es5-shim' ),
      __dirname + '/adapter_pre.min.js',
      path.resolve( path.join( baseUrl, rconfig.paths.jasmine ) ) + '.js',
      path.resolve( path.join( baseUrl, rconfig.paths.requirejs ) ) + '.js',
      __dirname + '/adapter_post.min.js'
   ].map( createPattern ) );
}
initLaxar.$inject = [ 'config' ];

module.exports = {
   'framework:laxar': [ 'factory', initLaxar ]
};
