'use strict';

require('./filter_stack'); // needs to have 'original' stack prep stored
const RunnerManager = require('./runner_manager');
const WatchManager = require('./watch_manager');
const Options = require('./options');

class CLI {
  static cli() {
    new CLI(process.argv.slice(2)).run();
  }
  constructor(args) {
    const options = new Options(args);
    this.settings = options.settings;
    this.errors = options.errors;

    const Manager = this.settings.watch ? WatchManager : RunnerManager;
    this.manager = new Manager(this.settings);

    this.reporter = new options.reporterClass(this.manager);
  }
  async run() {
    const failed = await this.manager.run();
    if (!this.settings.watch) process.exit(failed ? 1 : 0);
  }
}

module.exports = CLI;
