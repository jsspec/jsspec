'use strict';

require('./expose_global');
const path = require('path');

const requireFromCwd = file => {
  if (file.startsWith('.')) return require(path.join(process.cwd(), file));
  else {
    try {
      return require(file);
    }catch (error) {
      if (!error.message.includes(`Cannot find module '${file}'`)) throw error;

      return require(path.join(process.cwd(), file));
    }
  }
};

class Runner {
  constructor(runnerManager, filename, context) {
    this.settings = runnerManager.settings;
    this.manager = runnerManager;
    this.filename = filename;
    this.context = context;

    this.errors = [];
  }

  async run() {
    try {
      requireFromCwd(this.filename);
    }catch (error) {
      this.errors.push(error);
      console.log('LOAD ERROR', error);
    }
    await this.context.runChildren();
    return this.context.failed;}
}

module.exports = Runner;
