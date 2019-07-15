const Example = require('../example');

module.exports = {
  initialise() {
    this.beforeEachHooks = [];
  },
  instance: {
    addBeforeEach(example) {
      if (this.executing) { throw ReferenceError('An example block (`beforeEach`) can not be defined inside another'); }
      this.beforeEachHooks.push(example);
    },

    runBeforeEach: async function() {
      if(this.parent) await this.parent.runBeforeEach();

      for(let i=0; i< this.beforeEachHooks.length; i++) {
        await this.beforeEachHooks[i].run();
      }
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      if (block instanceof Function)
        this.currentContext.addBeforeEach(new Example(description, 'beforeEach', optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addBeforeEach(new Example(description, 'beforeEach', {}, optionOrBlock, this.currentContext));
      else if ( description instanceof Function)
        this.currentContext.addBeforeEach(new Example('', 'beforeEach', {}, description, this.currentContext));
      else throw TypeError('`beforeEach` must be provided an executable block');
    }
  }
};
