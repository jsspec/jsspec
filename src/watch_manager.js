'use strict';

const RunnerManager = require('./runner_manager');
const { watch } = require('fs');

const { fork } = require('child_process');

class AssuredMap extends Map {
  constructor(defaultConstruct = Object) {
    super();
    this.defaultConstruct = defaultConstruct;
  }

  get(key) {
    let value = super.get(key);
    if (!value) {
      value = new this.defaultConstruct();
      this.set(key, value);
    }
    return value;
  }
}

class WatchManager extends RunnerManager {
  constructor(settings) {
    super(settings);

    this.requiredFiles = new AssuredMap(Set);
    this.runState = new AssuredMap(Object);

    this.forkSpec = this.forkSpec.bind(this);

    this.on('required', this.addRequiredFile.bind(this));
  }

  forkSpec(name) {
    const runState = this.runState.get(name);
    if (runState.runner && runState.runner.connected) {
      runState.runner.send({ kill: true });
    }

    runState.runner = fork(__dirname + '/watch.js')
      .on('message', messageData => this.emit(...messageData))
      .send({ file: { name }, index: ++this.index, settings: this.settings });
  }

  addRequiredFile(specFile, requiredFile) {
    const requirement = this.requiredFiles.get(requiredFile).add(specFile);
    if (!requirement.watcher) {
      requirement.watcher = watch(
        requiredFile,
        { persistent: false, interval: 501 },
        this.debounceFork.bind(this, requiredFile)
      );
    }
  }

  complete() {
    const bail = () => {
      this.emit('runEnd');
      process.exit(0);
    };
    process.on('SIGINT', bail);
    process.stdin.on('data', data => data.toString() === 'x' && bail());
  }

  debounceFork(name) {
    let state = this.runState.get(name);
    clearTimeout(state.timer);
    state.timer = setTimeout(this.forkSpec.bind(this, name), 50);
  }

  runFile(file) { this.forkSpec(file.name); }
}

module.exports = WatchManager;
