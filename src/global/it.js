const Example = require('../example');

module.exports = {
  initialise() {
    this.examples = [];
  },
  instance: {
    addExecutor(example) {
      if (this.executing) { throw ReferenceError('An example block (`it`) can not be defined inside another'); }

      const prev = this.examples[this.examples.length - 1];
      this.examples.push(example);
      if (prev && prev.unIndexedLocation === example.unIndexedLocation) {
        let index;
        if (!prev.index) {
          index = this.index();
          index.push(0);
          prev.index = index;
        }
        index = prev.index.slice();
        index[index.length - 1]++;
        example.index = index;
      }
    },

    setTreeExecution(state) {
      this.executing = state;
      if (this.parent) this.parent.setTreeExecution(state);
    },

    runExample: async function(example) {
      this.setTreeExecution(true);
      try {
        this.emitter.emit('exampleStart', example);
        await this.runBeforeHooks();
        await this.runBeforeEach();

        await example.run();

        await this.runAfterEach();
      } catch (e) { 
        example.failure = e;
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
