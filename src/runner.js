'use strict';

require('./expose_global');

const Context = require('./context');
const resolve = require('./utility/resolve');

class Runner {
  constructor(settings, file, index) {
    this.index = index;
    this.settings = settings;

    this.file = { ...file };
    this.file.originalName = file.name;
    this.file.name = resolve(file.name);

    this.errors = [];
  }
  async run(emitter) {
    const key = `__${this.index}`;
    const context = Context.begin(emitter, key, { ...this.file, ...this.settings });
    emitter.emit('fileStart', key, this.file.name);
    try {
      require(this.file.name);
      await context.runChildren();
    } catch (error) {
      context.failed = true;
      context.failure = error;
      context.description = '[Load Error]';
      emitter.emit('contextLevelFailure', context);
    }
    emitter.emit('fileEnd', key, this.file.name);
    context.reset();
    return context.failed;
  }
}

module.exports = Runner;
