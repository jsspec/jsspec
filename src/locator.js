'use strict';

const prepareStackTrace = (error, stack) => {
  let os = 0;
  while (os < stack.length) {
    const fileName = stack[os].getFileName() || '';
    if (!fileName.startsWith(__dirname) && fileName.length) {
      return {
        fileName,
        line: stack[os].getLineNumber()
      };
    }
    os++;
  }
};


const getLocation = (owner) => {
  let preStack = Error.prepareStackTrace;
  let preDepth = Error.stackTraceLimit;
  
  Error.prepareStackTrace = prepareStackTrace;
  Error.captureStackTrace(owner);
  owner.stack;

  Error.prepareStackTrace = preStack;
  Error.stackTraceLimit = preDepth;
};

class Location {
  get location() {
    getLocation(this);
    return {...this.stack};
  }
}

module.exports = new Location();
