'use strict';

const errorDepth = Error.stackTraceLimit;
Error.stackTraceLimit = Infinity;

let previous;
let skip;

const reStack = stack => {
  if (skip || process.env.DEBUG) {
    skip = false;
    return stack.slice(0, errorDepth);
  }
  let os = 0;
  let result = [];
  while (os < stack.length && result.length < errorDepth + 2) {
    const fileName = stack[os].getFileName() || '';
    if (fileName.startsWith(__dirname)) {
      while (result.length && !result[result.length - 1].getFileName()) {
        result.pop();
      }
    } else {
      result.push(stack[os]);
    }
    os++;
  }
  if (result.length === 0 && stack.length > 0) result.push(stack[0]);
  return result.slice(0, errorDepth);
};

const depthPrep = (error, stack) => previous(error, reStack(stack));
const cleanPrep = (error, stack) => [error, ...reStack(stack)].join('\n    at ');
const prep = (error, stack) => ('function' === typeof previous ? depthPrep(error, stack) : cleanPrep(error, stack));

prep.skip = () => (skip = true);

const originalTrace = Error.prepareStackTrace;
Error.prepareStackTrace = prep;

module.exports = (error, existingPrepStack = originalTrace) => {
  const storePrep = previous;
  previous = existingPrepStack;
  error.stack;
  previous = storePrep;
  return error;
};
