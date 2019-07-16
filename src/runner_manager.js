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
    let fileLister = new Walker(this.settings.files, this.settings.random);

    let failed = false;
    let lister = fileLister.lister();
    for await (const file of lister) {
      failed = await this.runFile(file) || failed;
    }
    this.emit('runEnd');
    return failed;}

  async runFile(filename) {
    this.emit('fileStart', filename);
    const context = Context.begin(this, filename, this.settings);
    const runner = new Runner(this, filename, context);
    const failed = await runner.run();
    context.reset();
    this.emit('fileEnd', filename);
    return failed;}
}

module.exports = RunnerManager;
