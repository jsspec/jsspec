'use strict';

require('./expose_global');

const Context = require('./context');
const resolve = require('./utility/resolve');

class Runner {
  constructor(settings, file, index) {
    this.index = index;
    this.settings = settings;

    this.file = {...file};
    this.file.name = resolve(file.name);

    this.errors = [];
  }
  async run(emitter) {
    try {
      const key = `__${this.index}`;
      const context = Context.begin(emitter, key, { ...this.file, ...this.settings });
      require(this.file.name);
      emitter.emit('fileStart', key);
      await context.runChildren();
      emitter.emit('fileEnd', key);
      context.reset();
      return context.failed;
    }catch (error) {
      this.errors.push(error);
      console.log('LOAD ERROR', error);
      return false;
    }
  }
}

module.exports = Runner;
