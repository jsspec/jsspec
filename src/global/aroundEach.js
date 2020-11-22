const ExampleWrapper = require('../example_wrapper');

module.exports = {
  initialise() {
    this.aroundEach = [];
  },
  instance: {
    addAroundEach(exampleWrapper) {
      this.aroundEach.push(exampleWrapper);
    },

    wrapAroundEach(hookedExample) {
      let wrapped = this.aroundEach.reduceRight((inner, wrapper) => wrapper.around(inner), hookedExample);
      return this.parent.wrapAroundEach(wrapped);
    },

    hookedExample(example) {
      return {
        run: async () => {
          const storeFailure = error => example.failure || (example.failure = error);

          await this.runBeforeEach().catch(storeFailure);
          if (!example.failure) {
            await example.run().catch(storeFailure);
            await this.runAfterEach().catch(storeFailure);
          }
        },
      };
    },

    runAroundEach: async function (example) {
      let wrapped = this.wrapAroundEach(this.hookedExample(example));
      const storeFailure = error => example.failure || (example.failure = error);

      await wrapped.run().catch(storeFailure);
    },
  },
  global(description, optionOrBlock, block) {
    if (this.executing) throw new ReferenceError('A hook (`aroundEach`) can not be defined inside an example block');

    if (block instanceof Function) {
      /* noop */
    } else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else if (description instanceof Function) [description, optionOrBlock, block] = ['', {}, description];
    else throw TypeError('`aroundEach` must be provided an executable block');

    this.currentContext.addAroundEach(new ExampleWrapper(description, 'aroundEach', optionOrBlock, block, this.currentContext));
  },
};
