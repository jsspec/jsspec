'use strict';

const Context = require('../context');

module.exports = {
  initialise() {
    this.sharedContexts = [];
  },
  instance: {
    addSharedContext(context){
      if (this.executing) { throw ReferenceError('A shared context can not be defined inside an example'); }
      this.sharedContexts.push(context);
    },
    findSharedContext(requestedDescription) {
      let context = this.sharedContexts.find(({description}) => description === requestedDescription);
      if (!context && this.parent) {
        context = this.parent.findSharedContext(requestedDescription);
      }
      return context;
    }
  },
  global(description, optionsOrBlock, block) {
    if (block instanceof Function)
      this.currentContext.addSharedContext(new Context(description, optionsOrBlock, block));
    else if (optionsOrBlock instanceof Function)
      this.currentContext.addSharedContext(new Context(description, {}, optionsOrBlock));
    else
      throw TypeError('A shared context must be provided with an executable block');
  }
};
