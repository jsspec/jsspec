const Example = require('../example');

module.exports = {
  initialise() {
    this.afterEach = [];
  },
  instance: {
    addAfterEach(example) {
      if (this.executing) { throw ReferenceError('An example block (`afterEach`) can not be defined inside another'); }
      this.afterEach.push(example);
    },

    runAfterEach: async function() {
      for(let i=0; i< this.afterEach.length; i++) {
        await this.afterEach[i].run();
      }
      if(this.parent) await this.parent.runAfterEach();
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      if (block instanceof Function)
        this.currentContext.addAfterEach(new Example(description, 'afterEach', optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addAfterEach(new Example(description, 'afterEach', {}, optionOrBlock, this.currentContext));
      else if ( description instanceof Function)
        this.currentContext.addAfterEach(new Example('', 'afterEach', {}, description, this.currentContext));
      else throw TypeError('`afterEach` must be provided an executable block');
    }
  }
};
