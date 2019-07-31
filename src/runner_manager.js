'use strict';

const { watch } = require('fs');

const { EventEmitter } = require('events');
const { fork } = require('child_process');

const Runner = require('./runner');
const Walker = require('./walker');

let index = 0;

class RunnerManager extends EventEmitter {
  constructor(settings) {
    super();
    this.settings = settings;
    this.watched = new Map();
  }

  async run() {
    // check for errors
    let fileLister = new Walker(this.settings.files, this.settings.random);

    let failed = false;
    let lister = fileLister.lister();
    for await (const file of lister) {
      if (this.settings.watch) {
        //need to get the abs filename for this.
        this.addWatch(file);
      } else {
        failed = await this.runFile(file) || failed;
      }
    }
    if (!this.settings.watch) this.emit('runEnd');
    else {
      process.on('SIGINT', () => {
        this.emit('runEnd');
        process.exit(failed ? 1 : 0);
      });
    }
    return failed;
  }
  
  addWatch(file) {
    if (this.watched.has(file)) return;
    const watcher = watch(
      file.name, { persistent: true, interval: 501 },
      () => {
        const time = Date.now();
        if (time < watcher.time + 100) {
          clearTimeout(watcher.timeout);
        }
        watcher.time = time;
        watcher.timeout = setTimeout(() => this.runFile({ name: file.name }), 150);
      }
    );
    watcher.time = Date.now();
    this.watched.set(file, watcher);
    this.runFile(file);
  }

  async runFile(file) {
    // fork here
    if (this.settings.watch) {
      return await new Promise(resolve => fork(__dirname + '/watch.js')
        .on('exit', resolve)
        .on('message', messageData => this.emit(...messageData))
        .send({ file, index: index++, settings: this.settings })
      ).catch(e => console.log(e));
    } else {
      // call in the -required files here, instead of in options
      const runner = new Runner(this.settings, file, index++);
      return await runner.run(this);
    }
  }
}

module.exports = RunnerManager;
