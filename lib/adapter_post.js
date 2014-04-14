( function( karma, requirejs, jasmine, laxarSpec, locationPathname ) {


/* Original source:
 * https://github.com/karma-runner/karma-jasmine/blob/v0.2.2/src/adapter.js */
/*
The MIT License

Copyright (C) 2011-2013 Google, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var formatFailedStep = function(step) {
  var stack   = step.stack;
  var message = step.message;

  if (stack) {
    // remove the trailing dot
    var firstLine = stack.substring(0, stack.indexOf('\n') - 1);

    if (message && message.indexOf(firstLine) === -1) {
      stack = message +'\n'+ stack;
    }

    // remove jasmine stack entries
    return stack.replace(/\n.+jasmine\.js\?\w*\:.+(?=(\n|$))/g, '');
  }

  return message;
};


var indexOf = function(collection, item) {
  if (collection.indexOf) {
    return collection.indexOf(item);
  }

  for (var i = 0, l = collection.length; i < l; i++) {
    if (collection[i] === item) {
      return i;
    }
  }

  return -1;
};

/* Original source:
 * https://github.com/karma-runner/karma-requirejs/blob/v0.2.1/src/adapter.js */
/*
The MIT License

Copyright (C) 2011-2013 Google, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// monkey patch requirejs, to use append timestamps to sources
// to take advantage of karma's heavy caching
// it would work even without this hack, but with reloading all the files all the time

var normalizePath = function(path) {
  var normalized = [];
  var parts = path.split('/');

  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === '.') {
      continue;
    }

    if (parts[i] === '..' && normalized.length && normalized[normalized.length - 1] !== '..') {
      normalized.pop();
      continue;
    }

    normalized.push(parts[i]);
  }

  return normalized.join('/');
};

var createPatchedLoad = function(files, originalLoadFn, locationPathname) {
  var IS_DEBUG = /debug\.html$/.test(locationPathname);

  return function(context, moduleName, url) {
    url = normalizePath(url);

    if (files.hasOwnProperty(url)) {
      if (!IS_DEBUG) {
        url = url + '?' + files[url];
      }
    }

    return originalLoadFn.call(this, context, moduleName, url);
  };
};

/* Original source:
 * https://github.com/karma-runner/karma-jasmine/blob/v0.1.5/src/adapter.js */
/*
The MIT License

Copyright (C) 2011-2013 Google, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Very simple reporter for jasmine
 */
var Jasmine1KarmaReporter = function(karma) {

  var getAllSpecNames = function(topLevelSuites) {
    var specNames = {};

    var processSuite = function(suite, pointer) {
      var childSuite;
      var childPointer;

      for (var i = 0; i < suite.suites_.length; i++) {
        childSuite = suite.suites_[i];
        childPointer = pointer[childSuite.description] = {};
        processSuite(childSuite, childPointer);
      }

      pointer._ = [];
      for (var j = 0; j < suite.specs_.length; j++) {
        pointer._.push(suite.specs_[j].description);
      }
    };

    var suite;
    var pointer;
    for (var k = 0; k < topLevelSuites.length; k++) {
      suite = topLevelSuites[k];
      pointer = specNames[suite.description] = {};
      processSuite(suite, pointer);
    }

    return specNames;
  };

  this.reportRunnerStarting = function(runner) {
    karma.info({total: runner.specs().length, specs: getAllSpecNames(runner.topLevelSuites())});
  };

  this.reportRunnerResults = function(runner) {
    karma.complete({
      coverage: window.__coverage__
    });
  };

  this.reportSuiteResults = function(suite) {
    // memory clean up
    suite.after_ = null;
    suite.before_ = null;
    suite.queue = null;
  };

  this.reportSpecStarting = function(spec) {
    spec.results_.time = new Date().getTime();
  };

  this.reportSpecResults = function(spec) {
    var result = {
      id: spec.id,
      description: spec.description,
      suite: [],
      success: spec.results_.failedCount === 0,
      skipped: spec.results_.skipped,
      time: spec.results_.skipped ? 0 : new Date().getTime() - spec.results_.time,
      log: []
    };

    var suitePointer = spec.suite;
    while (suitePointer) {
      result.suite.unshift(suitePointer.description);
      suitePointer = suitePointer.parentSuite;
    }

    if (!result.success) {
      var steps = spec.results_.items_;
      for (var i = 0; i < steps.length; i++) {
        if (!steps[i].passed_) {
          result.log.push(formatFailedStep(steps[i]));
        }
      }
    }

    karma.result(result);

    // memory clean up
    spec.results_ = null;
    spec.spies_ = null;
    spec.queue = null;
  };

  this.log = function() {};
};

/* Original source:
 * https://github.com/karma-runner/karma-jasmine/blob/v0.2.2/src/adapter.js */
/*
The MIT License

Copyright (C) 2011-2013 Google, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var SuiteNode = function(name, parent) {
  this.name = name;
  this.parent = parent;
  this.children = [];

  this.addChild = function(name) {
    var suite = new SuiteNode(name, this);
    this.children.push(suite);
    return suite;
  };
};


var getAllSpecNames = function(topSuite) {
  var specNames = {};

  function processSuite(suite, pointer) {
    var child;
    var childPointer;

    for (var i = 0; i < suite.children.length; i++) {
      child = suite.children[i];

      if (child.children) {
        childPointer = pointer[child.description] = {_: []};
        processSuite(child, childPointer);
      } else {
        pointer._.push(child.description);
      }
    }
  }

  processSuite(topSuite, specNames);

  return specNames;
};


/**
 * Very simple reporter for Jasmine.
 */
var Jasmine2KarmaReporter = function(karma, jasmineEnv) {

  var currentSuite = new SuiteNode();

  /**
   * Jasmine 2.0 dispatches the following events:
   *
   *  - jasmineStarted
   *  - jasmineDone
   *  - suiteStarted
   *  - suiteDone
   *  - specStarted
   *  - specDone
   */

  this.jasmineStarted = function(data) {
    // TODO(vojta): Do not send spec names when polling.
    karma.info({
      total: data.totalSpecsDefined,
      specs: getAllSpecNames(jasmineEnv.topSuite())
    });
  };


  this.jasmineDone = function() {
    karma.complete({
      coverage: window.__coverage__
    });
  };


  this.suiteStarted = function(result) {
    currentSuite = currentSuite.addChild(result.description);
  };


  this.suiteDone = function(result) {
    // In the case of xdescribe, only "suiteDone" is fired.
    // We need to skip that.
    if (result.description !== currentSuite.name) {
      return;
    }

    currentSuite = currentSuite.parent;
  };


  this.specStarted = function(specResult) {
    specResult.startTime = new Date().getTime();
  };


  this.specDone = function(specResult) {
    var skipped = specResult.status === 'disabled' || specResult.status === 'pending';

    var result = {
      description : specResult.description,
      id          : specResult.id,
      log         : [],
      skipped     : skipped,
      success     : specResult.failedExpectations.length === 0,
      suite       : [],
      time        : skipped ? 0 : new Date().getTime() - specResult.startTime
    };

    // generate ordered list of (nested) suite names
    var suitePointer = currentSuite;
    while (suitePointer.parent) {
      result.suite.unshift(suitePointer.name);
      suitePointer = suitePointer.parent;
    }

    if (!result.success) {
      var steps = specResult.failedExpectations;
      for (var i = 0, l = steps.length; i < l; i++) {
        result.log.push(formatFailedStep(steps[i]));
      }
    }

    karma.result(result);
    delete specResult.startTime;
  };
};

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

requirejs.load = createPatchedLoad( karma.files, requirejs.load, locationPathname );
karma.start = createStartFn( karma, requirejs, jasmine, laxarSpec );

} )( window.__karma__, window.requirejs, window.jasmine, window.laxarSpec, window.location.pathname );
