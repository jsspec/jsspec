const Example = require('../example');

module.exports = {
  initialise() {
    this.afterHooks = [];
  },
  instance: {
    addAfterHook(example) {
      if (this.executing) { throw ReferenceError('An example block (`after`) can not be defined inside another'); }
      this.afterHooks.push(example);
    },

    runAfterHooks: async function() {
      const master = !this.executing;
      if (master) this.setTreeExecution(true);

      for(let i=0; i< this.afterHooks.length; i++) {
        const hook = this.afterHooks[i];
        if (!hook.hasRun) {
          try{
            hook.hasRun = true;
            await hook.run();
          }catch(failure) {
            hook.failure = failure;
            this.emitter.emit('contextLevelFailure', hook);
          }
        }
      }
      if(this.parent) await this.parent.runAfterHooks();

      if (master) {
        this.endBlock();
        this.setTreeExecution(false);
      }
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      let expandedDescription = optionOrBlock ? `In after hook: ${description.toString()}` : 'In after hook';

      if (block instanceof Function)
        this.currentContext.addAfterHook(new Example(expandedDescription, 'after', optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addAfterHook(new Example(expandedDescription, 'after', {}, optionOrBlock, this.currentContext));
      else if ( description instanceof Function)
        this.currentContext.addAfterHook(new Example('In after hook', 'after', {}, description, this.currentContext));
      else throw TypeError('`after` must be provided an executable block');
    }
  }
};
