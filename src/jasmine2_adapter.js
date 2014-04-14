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
