'use strict';

let previous;

const wrapForWindows = file => file.replace(/\\/g, '\\\\');

const prepareStackTraceModified = (error, stack) => {
  let modifiedStack = previous(error, stack);
  let os = 0;
  const previousStack = modifiedStack.split('\n');
  while (os < stack.length) {
    const fileName = stack[os].getFileName();
    if (fileName && !fileName.startsWith(__dirname)) {
      const previousStackLine = previousStack[os + 1] || '';
      const lineSupply = previousStackLine.match(new RegExp(`${wrapForWindows(fileName)}:(\\d+)`));
      return {
        fileName,
        line: lineSupply ? parseInt(lineSupply[1]) /* c8 ignore next */ : null,
      };
    }
    os++;
  }
};

const getLocation = owner => {
  previous = Error.prepareStackTrace;
  if (previous.skip) previous.skip();
  Error.prepareStackTrace = prepareStackTraceModified;
  Error.captureStackTrace(owner);
  owner.stack;

  Error.prepareStackTrace = previous;
};

class Location {
  get location() {
    getLocation(this);
    return { ...this.stack };
  }
}

module.exports = new Location();
