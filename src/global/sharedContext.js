'use strict';

const Context = require('../context');

module.exports = {
  initialise() {
    this.sharedContexts = [];
  },
  instance: {
    addSharedContext(context) {
      this.sharedContexts.push(context);
    },
    findSharedContext(requestedDescription) {
      return this.sharedContexts.find(({ description }) => description === requestedDescription) ||
        this.parent.findSharedContext(requestedDescription);
    }
  },
  global(description, optionsOrBlock, block) {
    if (this.executing) { throw new ReferenceError('A shared context can not be defined inside an example'); }

    if (block instanceof Function) { /* noop */ }
    else if (optionsOrBlock instanceof Function) [optionsOrBlock, block] = [{}, optionsOrBlock];
    else throw TypeError('A shared context must be provided with an executable block');

    this.currentContext.addSharedContext(new Context(description, optionsOrBlock, block));
  }
};
