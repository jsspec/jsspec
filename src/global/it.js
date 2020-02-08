const Example = require('../example');
const filterStack = require('../filter_stack');

const noOp = () => undefined;

module.exports = {
  initialise() {
    this.examples = [];
  },
  instance: {
    addExecutor(example) {
      if (this.executing) { throw ReferenceError('An example block (`it`) can not be defined inside another'); }

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
      if (this.parent) this.parent.setTreeExecution(state);
    },

    async runExample(example) {
      this.setTreeExecution(true);
      let attemptEachAfterIfFailed = false;
      try {
        this.emitter.emit('exampleStart', example);
        await this.runBeforeHooks();
        await this.runBeforeEach();
        attemptEachAfterIfFailed = true;
        await example.run();
        attemptEachAfterIfFailed = false;
        await this.runAfterEach();
      } catch (e) {
        filterStack(e);
        example.failure = e;
        if (attemptEachAfterIfFailed) {
          await this.runAfterEach().catch(noOp);
        }
      }
      this.emitter.emit('exampleEnd', example);
      this.endBlock();
      this.setTreeExecution(false);
      return !!example.failure;
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      if (block instanceof Function)
        this.currentContext.addExecutor(new Example(description, 'it', optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addExecutor(new Example(description, 'it', {}, optionOrBlock, this.currentContext));
      else throw TypeError('`it` must be provided an executable block');
    }
  }
};
