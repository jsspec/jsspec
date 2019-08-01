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
    this.watchers = new Map();
    this.requiredFiles = new Map();
    this.specFiles = new Map();

    if (this.settings.watch) {
      this.on('required', this.addRequiredFile.bind(this));
      this.on('fileEnd', this.purgeFiles.bind(this));

      this.runViaFork = this.runViaFork.bind(this);
    }
  }

  purgeFiles(_, specFile) {
    const specFileData = this.specFiles.get(specFile);
    if (!specFileData) return;

    this.requiredFiles.forEach((specFiles, owned) => {
      if (!specFileData.has(owned)) specFiles.delete(specFile);
    });
    specFileData.clear();
  }

  runWatched(changedFile) {
    this.requiredFiles.get(changedFile).forEach(this.runViaFork);
  }

  forkSpec(name) {
    fork(__dirname + '/watch.js')
      .on('message', messageData => this.emit(...messageData))
      .send({ file: { name }, index: ++index, settings: this.settings })
  }

  addRequiredFile(specFile, requiredFile) {
    if (!this.specFiles.has(specFile)) { // first run - first file
      const specInfo = new Set();
      specInfo.time = Date.now();
      this.specFiles.set(specFile, specInfo);
    }
    this.specFiles.get(specFile).add(requiredFile);
    let specFilesThatRequire = this.requiredFiles.get(requiredFile);
    if (!specFilesThatRequire) {
      // set a listener for this file
      specFilesThatRequire = new Set();
      this.requiredFiles.set(requiredFile, specFilesThatRequire);
    }
    specFilesThatRequire.add(specFile);
    if (!this.watchers.has(requiredFile)){
      const watcher = watch(requiredFile, { persistent: true, interval: 501 }, () => this.runWatched(requiredFile));
      this.watchers.set(requiredFile, watcher);
    }
  }

  async run() {
    // check for errors
    let fileLister = new Walker(this.settings.files, this.settings.random);

    let failed = false;
    let lister = fileLister.lister();
    for await (const file of lister) {
      if (this.settings.watch) {
        this.runViaFork(file.name);
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
    return failed;}

  runViaFork(name) {
    let specInfo = this.specFiles.get(name);
    const time = Date.now();
    if (!specInfo) {
      specInfo = new Set();
      specInfo.time = time;
      this.specFiles.get(name);
      return this.forkSpec(name);
    }
    // debounce
    if (specInfo && time < specInfo.time + 100) {
      clearTimeout(specInfo.timer);
    }
    specInfo.time = time;
    specInfo.timer = setTimeout(() => this.forkSpec(name), 140);
  }

  async runFile(file) {
    const runner = new Runner(this.settings, file, ++index);
    return await runner.run(this);}
}

module.exports = RunnerManager;
