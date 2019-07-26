'use strict';

const originalPrep = Error.prepareStackTrace;

let previous;
let preDepth;

const prepareStackTraceModified = (error, stack) => {
  let modifiedStack = previous(error, stack);

  let os = 0;
  while (os < stack.length) {
    const fileName = stack[os].getFileName();
    if (fileName && !fileName.startsWith(__dirname)) {
      const previousStack = modifiedStack.split('\n');
      return {
        fileName,
        line: parseInt(previousStack[os + 1].match(new RegExp(`${fileName}:(\\d+)`))[1])
      };
    }
    os++;
  }
};


const prepareStackTraceNice = (error, stack) => {
  let os = 0;
  while (os < stack.length) {
    const fileName = stack[os].getFileName();
    if (fileName && !fileName.startsWith(__dirname)) {
      return {
        fileName,
        line: stack[os].getLineNumber()
      };
    }
    os++;
  }
};

const getLocation = (owner) => {
  previous = Error.prepareStackTrace;
  preDepth = Error.stackTraceLimit;

  if (previous !== originalPrep) Error.prepareStackTrace = prepareStackTraceModified;
  else Error.prepareStackTrace = prepareStackTraceNice;
  Error.captureStackTrace(owner);
  owner.stack;

  Error.prepareStackTrace = previous;
  Error.stackTraceLimit = preDepth;
};

class Location {
  get location() {
    getLocation(this);
    return { ...this.stack };
  }
}

module.exports = new Location();
