const Example = require('../example');

module.exports = {
  initialise() {
    this.beforeEachHooks = [];
  },
  instance: {
    addBeforeEach(example) {
      this.beforeEachHooks.push(example);
    },

    runBeforeEach: async function() {
      await this.parent.runBeforeEach();

      for(let i=0; i< this.beforeEachHooks.length; i++) {
        await this.beforeEachHooks[i].run();
      }
    }
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('An example block (`beforeEach`) can not be defined inside another');

    if (block instanceof Function) { /* noop */ }
    else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else if ( description instanceof Function) [description, optionOrBlock, block] = ['', {}, description];
    else throw TypeError('`beforeEach` must be provided an executable block');

    this.currentContext.addBeforeEach(new Example(description, 'beforeEach', optionOrBlock, block, this.currentContext));
  }
};
