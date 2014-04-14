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
