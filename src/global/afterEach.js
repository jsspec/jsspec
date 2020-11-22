const Example = require('../example');

module.exports = {
  initialise() {
    this.afterEach = [];
  },
  instance: {
    addAfterEach(example) {
      this.afterEach.push(example);
    },

    runAfterEach: async function () {
      for (let i = 0; i < this.afterEach.length; i++) {
        await this.afterEach[i].run();
      }
      await this.parent.runAfterEach();
    },
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('An example block (`afterEach`) can not be defined inside another');

    if (block instanceof Function) {
      /* noop */
    } else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else if (description instanceof Function) [description, optionOrBlock, block] = ['', {}, description];
    else throw TypeError('`afterEach` must be provided an executable block');

    this.currentContext.addAfterEach(new Example(description, 'afterEach', optionOrBlock, block, this.currentContext));
  },
};
