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
