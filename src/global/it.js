const Example = require('../example');

module.exports = {
  initialise() {
    this.examples = [];
  },
  instance: {
    addExecutor(example) {
      const beforeZeroIndex = [...this.index(), -1];
      const prev = this.examples[this.examples.length - 1] || { index: beforeZeroIndex };
      this.examples.push(example);
      if (!this.indexed && prev.unIndexedLocation !== example.unIndexedLocation) return;
      if (prev.unIndexedLocation === example.unIndexedLocation && !prev.index) {
        prev.index = [...this.index(), 0];
      }
      example.index = [...(prev.index || beforeZeroIndex)];
      example.index[example.index.length - 1]++;
    },

    setTreeExecution(state) {
      this.executing = state;
      this.parent.setTreeExecution(state);
    },
    async runExample(example) {
      this.startBlock();
      this.emitter.emit('exampleStart', example);
      const storeFailure = error => (example.failure = error);

      await this.runBeforeHooks().catch(storeFailure);

      if (!example.failure) await this.runAroundEach(example);

      this.emitter.emit('exampleEnd', example);
      this.endBlock();
      return !!example.failure;
    },
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('An example block (`it`) can not be defined inside another');

    if (block instanceof Function) {
      /* noop */
    } else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else throw TypeError('`it` must be provided an executable block');

    this.currentContext.addExecutor(new Example(description, 'it', optionOrBlock, block, this.currentContext));
  },
};
