const Example = require('../example');

module.exports = {
  initialise() {
    this.beforeHooks = [];
  },
  instance: {
    addBeforeHook(example) {
      this.beforeHooks.push(example);
    },

    runBeforeHooks: async function() {
      await this.parent.runBeforeHooks();

      let hook;
      const handleError = error => hook.error = error;

      for(let i=0; i< this.beforeHooks.length; i++) {
        hook = this.beforeHooks[i];

        if (!hook.hasRun) {
          await hook.run().catch(handleError);
          hook.hasRun = true;
        }

        if (hook.error) throw hook.error;
      }
    }
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('A hook (`before`) can not be defined inside an example block');

    if (block instanceof Function) { /* noop */ }
    else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else if ( description instanceof Function) [description, optionOrBlock, block] = ['', {}, description];
    else throw TypeError('`before` must be provided an executable block');

    this.currentContext.addBeforeHook(new Example(description, 'before', optionOrBlock, block, this.currentContext));
  }
};
