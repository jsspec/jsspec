'use strict';

const Example = require('./example');

/* c8 ignore next 2 */
const Generator = function* () {}.constructor;
const AsyncGenerator = async function* () {}.constructor;

class ExampleWrapper extends Example {
  around(example) {
    this.child = example;
    return this;
  }

  async runGenerator() {
    const runner = this.block();
    let partial = runner.next();
    await this.child.run();
    if (!partial.done) {
      runner.next();
    }
  }

  async runAsyncGenerator() {
    const runner = this.block();
    let partial = await runner.next();
    await this.child.run();
    if (!partial.done) {
      await runner.next();
    }
  }

  async run() {
    if (this.block instanceof Generator) await this.runGenerator();
    else if (this.block instanceof AsyncGenerator) await this.runAsyncGenerator();
    else await this.block(async () => await this.child.run());
  }
}

module.exports = ExampleWrapper;
