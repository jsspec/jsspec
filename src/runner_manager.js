'use strict';

const { EventEmitter } = require('events');

const Runner = require('./runner');
const Walker = require('./walker');
const Rand = require('./utility/rand');

class RunnerManager extends EventEmitter {
  constructor(settings) {
    super();
    this.index = 0;
    this.settings = settings;
    Rand.seed(this.settings.seed);
  }

  complete() {
    this.emit('runEnd');
  }

  async run() {
    // check for errors
    let fileLister = new Walker(this.settings.files, this.settings.random);

    let failed = false;
    let lister = fileLister.lister();
    for await (const file of lister) {
      failed = (await this.runFile(file)) || failed;
    }
    this.complete();
    return failed;
  }

  async runFile(file) {
    const runner = new Runner(this.settings, file, ++this.index);
    return await runner.run(this);
  }
}

module.exports = RunnerManager;
