'use strict';

const Context = require('../context');

module.exports = {
  initialise() {
    this.sharedExamples = [];
  },
  instance: {
    addSharedExamples(context) {
      this.sharedExamples.push(context);
    },
    findExamples(requestedDescription) {
      return this.sharedExamples.find(({ description }) => description === requestedDescription) || this.parent.findExamples(requestedDescription);
    },
  },
  global(description, optionsOrBlock, block) {
    if (this.executing) {
      throw new ReferenceError('A shared example can not be defined inside an example');
    }

    if (block instanceof Function) {
      /* noop */
    } else if (optionsOrBlock instanceof Function) [optionsOrBlock, block] = [{}, optionsOrBlock];
    else throw TypeError('A shared example must be provided with an executable block');

    this.currentContext.addSharedExamples(new Context(description, optionsOrBlock, block));
  },
};
