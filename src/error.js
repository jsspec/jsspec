const errorDepth = Error.stackTraceLimit;
Error.stackTraceLimit = Infinity;

Error.prepareStackTrace = (error, stack) => {
  let os = 0;
  let result = [];
  while (os < stack.length && result.length < errorDepth + 2) {
    const fileName = stack[os].getFileName() || '';
    if (fileName.startsWith(__dirname)) {
      while (result.length && !result[result.length - 1].getFileName()) {
        result.pop();
      }
    } else 
    {
      result.push(stack[os]);
    }
    os++;
  }
  if (process.env.DEBUG) return [error].concat(stack).join('\n    at ');

  return [error].concat(result.slice(0, errorDepth)).join('\n    at ');
};
