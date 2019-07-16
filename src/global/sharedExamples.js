'use strict';

const Context = require('../context');

// only the globalised method sits here. The functionality is in the base class
module.exports = {
  initialise() {
    this.sharedExamples = [];
  },
  instance: {
    addSharedExamples(context){
      if (this.executing) { throw ReferenceError('A shared example can not be defined inside an example'); }
      this.sharedExamples.push(context);
    },
    findExamples(requestedDescription) {
      let context = this.sharedExamples.find(({description}) => description === requestedDescription);
      if (!context && this.parent) {
        context = this.parent.findExamples(requestedDescription);
      }
      return context;
    }
  },
  global(description, optionsOrBlock, block) {
    if (block instanceof Function)
      this.currentContext.addSharedExamples(new Context(description, optionsOrBlock, block));
    else if (optionsOrBlock instanceof Function)
      this.currentContext.addSharedExamples(new Context(description, {}, optionsOrBlock));
    else
      throw TypeError('A shared example must be provided with an executable block');
  }
};
