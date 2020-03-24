const filterStack = require('../filter_stack');
const Example = require('../example');

class AfterExample extends Example {
  get fullDescription() {
    return ' [In after hook]' + super.fullDescription;
  }
}

module.exports = {
  initialise() {
    this.afterHooks = [];
  },
  instance: {
    addAfterHook(example) {
      this.afterHooks.push(example);
    },

    runAfterHooks: async function () {
      // after hooks do not run inside the example executor
      this.startBlock();

      let hook;
      const handleError = failure => {
        hook.failure = filterStack(failure);
        this.emitter.emit('contextLevelFailure', hook);
      };

      for (let i = 0; i < this.afterHooks.length; i++) {
        hook = this.afterHooks[i];

        await hook.run().catch(handleError);
      }

      this.endBlock();
    }
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('A hook (`after`) can not be defined inside an example block');

    if (block instanceof Function) { /* noop */ }
    else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else if (description instanceof Function) [description, optionOrBlock, block] = ['after hook', {}, description];
    else throw TypeError('`after` must be provided an executable block');
    this.currentContext.addAfterHook(new AfterExample(description, 'after', optionOrBlock, block, this.currentContext));

  }
};
