require('./expose_global');

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
      require(this.filename);
    } catch (error) {
      this.errors.push(error);
      console.log('LOAD ERROR', error);
    }
    await this.context.runChildren();
  }
}

module.exports = Runner;
