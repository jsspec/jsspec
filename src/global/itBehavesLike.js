'use strict';

const Context = require('../context');

class SharedExamples extends Context {
  get indexed() { return true; }
}

module.exports = {
  global(sharedExamplesName, ...args) {
    const sharedExampleContext = this.currentContext.findExamples(sharedExamplesName);

    if (!sharedExampleContext) {
      this.currentContext.failure = ReferenceError(`No shared example named '${sharedExamplesName}' available in this context`);
      this.currentContext.emitter.emit('contextLevelFailure', this.currentContext);
      return;
    }

    const context = new SharedExamples(
      `it behaves like ${sharedExampleContext.description}`,
      sharedExampleContext.optionsOrBlock,
      sharedExampleContext.contextBlock.bind(null, ...args),
      this.currentContext);

    context.prepare();
  }
};
