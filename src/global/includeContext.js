'use strict';

module.exports = {
  global(sharedExamplesName, ...args) {
    const sharedContext = this.currentContext.findSharedContext(sharedExamplesName);

    if (!sharedContext) {
      this.currentContext.failure = new ReferenceError(`No shared context named '${sharedExamplesName}' available in this context`);
      this.currentContext.emitter.emit('contextLevelFailure', this.currentContext);
      return;
    }

    const preState = this.currentContext.indexed;
    this.currentContext.indexed = true;

    // don't change the current context
    sharedContext.contextBlock.apply(null, args);
    this.currentContext.indexed = preState;
  },
};
