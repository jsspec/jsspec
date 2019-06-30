const { EventEmitter } = require('events');
const Runner = require('./runner');
const Walker = require('./walker');

const Context = require('./context');

class RunnerManager extends EventEmitter {
  constructor(settings) {
    super();
    this.settings = settings;
  }

  async run() {
    // check for errors
    let fileList = new Walker(this.settings.files).all;
    if (this.settings.random) fileList = fileList.sort(() => Math.random() - 0.5);

    for (let i = 0; i < fileList.length; i++) {
      await this.runFile(fileList[i]);
    }
    this.emit('runEnd');
  }

  async runFile(filename) {
    this.emit('fileStart', filename);
    const context = Context.begin(this, filename, this.settings);
    const runner = new Runner(this, filename, context);
    await runner.run();
    context.reset();
    this.emit('fileEnd', filename);
  }
}

module.exports = RunnerManager;
