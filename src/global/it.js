class Location {}
class AssertionError extends Error {}

class Example {
  constructor(description, options, block, context) {
    const { timeout } = {timeout: 200, ...context, ...options};

    this.timeout = timeout;

    const location = new Location();
    Error.captureStackTrace(location);
    this._location = location.stack;
    this.description = description;
    this.block = block;
    this.context = context;
  }

  get fullDescription() {
    return this.context.fullDescription + ' ' + this.description;
  }

  get location() {
    if (this.index) {
      return this._location.fileName + '[' + this.index.map(v => v + 1).join(':') + ']';
    }
    return this.unIndexedLocation;
  }

  get unIndexedLocation() {
    return this._location.fileName + ':' + this._location.line;
  }

  async run() {
    if (this.timeout > 0)
      return Promise.race([this.block(), this.timer()]).then(() => {});
    return await this.block();
  }

  timer() {
    return new Promise((_, reject) => setTimeout(() => reject(new AssertionError(`example timeout (${this.timeout}ms) exceeded`)), this.timeout));
  }
}

module.exports = {
  Example,

  initialise() {
    this.examples = [];
  },
  instance: {
    addExecutor(example) {
      if (this.executing) { throw ReferenceError('An example block can not be defined inside another'); }

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
        this.runBeforeEach();
        this.emitter.emit('exampleStart', example);

        await example.run();

        this.runAfterEach();
      } catch (e) { example.failure = e; }
      this.emitter.emit('exampleEnd', example);
      this.endBlock();
      this.setTreeExecution(false);
    }
  },
  global: {
    build(description, optionOrBlock, block) {
      if (block instanceof Function)
        this.currentContext.addExecutor(new Example(description, optionOrBlock, block, this.currentContext));
      else if (optionOrBlock instanceof Function)
        this.currentContext.addExecutor(new Example(description, {}, optionOrBlock, this.currentContext));
      else throw TypeError('example must be provided an executable block');
    }
  }
};
