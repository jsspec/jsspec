const Example = require('../example');
const filterStack = require('../filter_stack');

const noOp = () => undefined;

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

    async hookedExample(example) {
      const storeFailure = error => example.failure = example.failure || filterStack(error);

      await this.runBeforeEach().catch(storeFailure);
      if (!example.failure) {
        await example.run().catch(storeFailure);
        await this.runAfterEach().catch(storeFailure);
      }
    },
    async runExample(example) {
      this.startBlock();
      this.emitter.emit('exampleStart', example);
      await this.runBeforeHooks().catch(error => example.failure = filterStack(error));
      await this.hookedExample(example);

      this.emitter.emit('exampleEnd', example);
      this.endBlock();
      return !!example.failure;
    }
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('An example block (`it`) can not be defined inside another');

    if (block instanceof Function) { /* noop */ }
    else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else throw TypeError('`it` must be provided an executable block');

    this.currentContext.addExecutor(new Example(description, 'it', optionOrBlock, block, this.currentContext));
  }
};
