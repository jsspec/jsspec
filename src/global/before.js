const Example = require('../example');

module.exports = {
  initialise() {
    this.beforeHooks = [];
  },
  instance: {
    addBeforeHook(example) {
      if (this.executing) { throw ReferenceError('An example block (`before`) can not be defined inside another'); }
      this.beforeHooks.push(example);
    },

    runBeforeHooks: async function() {
      if(this.parent) await this.parent.runBeforeHooks();

      for(let i=0; i< this.beforeHooks.length; i++) {
        const hook = this.beforeHooks[i];
        if (!hook.hasRun) {
          await hook.run().catch(error => hook.error = error);
          hook.hasRun = true;
        }
        if (hook.error) throw hook.error;
      }
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      if (block instanceof Function)
        this.currentContext.addBeforeHook(new Example(description, 'before', optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addBeforeHook(new Example(description, 'before', {}, optionOrBlock, this.currentContext));
      else if ( description instanceof Function)
        this.currentContext.addBeforeHook(new Example('', 'before', {}, description, this.currentContext));
      else throw TypeError('`before` must be provided an executable block');
    }
  }
};
