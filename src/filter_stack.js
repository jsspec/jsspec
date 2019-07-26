'use strict';
require('./locator'); // allow locator to store original prep

const originalPrep = Error.prepareStackTrace;
let previous;
let errorDepth;

const stackFrameIndices = stack => {
  let os = 0;
  let result = [];
  while (os < stack.length && result.length < errorDepth + 2) {
    const fileName = stack[os].getFileName() || '';
    if (fileName.startsWith(__dirname)) {
      while (result.length && !stack[result[result.length - 1]].getFileName()) {
        result.pop();
      }
    } else {
      result.push(os);
    }
    os++;
  }
  return result;
};

const prepareStackTraceModified = (error, stack) => {
  let modifiedStack = previous(error, stack);
  if (process.env.DEBUG) return modifiedStack;

  modifiedStack = modifiedStack.split(/\n\s+at.*\((.*)\)$/m).filter((_, index) => index % 2);

  const frameIndexes = stackFrameIndices(stack);

  return [
    error,
    ...frameIndexes.slice(0, errorDepth).map(index =>
      stack[index]
        .toString()
        .replace(/^(.*)\(.*\)$/, `$1(${modifiedStack[index]})`)
    )
  ].join('\n    at ');
};

const prepareStackTraceNice = (error, stack) => {
  if (process.env.DEBUG) return [error, ...stack].join('\n    at ');

  const frameIndexes = stackFrameIndices(stack);

  return [
    error, ...frameIndexes.slice(0, errorDepth).map(index => stack[index])
  ].join('\n    at ');
};

module.exports = error => {
  errorDepth = Error.stackTraceLimit;
  previous = Error.prepareStackTrace;

  Error.stackTraceLimit = Infinity;
  if (previous !== originalPrep) Error.prepareStackTrace = prepareStackTraceModified;
  else Error.prepareStackTrace = prepareStackTraceNice;
  error.stack;

  Error.stackTraceLimit = errorDepth;
  Error.prepareStackTrace = previous;
};
