'use strict';

const locator = require('./locator');

class AssertionError extends Error {}

class Example {
  constructor(description, kind, options, block, context) {
    const { timeout } = {timeout: 200, ...context, ...options};
    this.timeout = timeout;

    this.kind = kind;
    this.description = description;
    this.block = block;
    this.context = context;

    this._location = locator.location;
  }

  toJSON() {
    return {
      description: this.description,
      fullDescription: this.fullDescription,
      kind: this.kind,
      base: this.base,
      timeout: this.timeout,
      failure: this.failure && {
        constructor: {
          name: this.failure.constructor.name
        },
        stack: this.failure.stack,
        message: this.failure.message,
        expected: this.failure.expected,
        actual: this.failure.actual,
      }
    };
  }

  get base() {
    return this.context.base;
  }
  get fullDescription() {
    return this.context.fullDescription + ' ' + this.description;
  }

  get location() {
    if (this.index) {
      return this._location.fileName + '[' + this.index.map(v => v + 1).join(':') + ']';
    }
    return this.unIndexedLocation;
  }

  get unIndexedLocation() {
    return this._location.fileName + ':' + this.line;
  }

  get line() {
    return this._location.line;
  }

  async run() {
    if (this.timeout > 0)
      return Promise.race([this.block(), this.timer()]).then(() => {});
    await this.block();
  }

  timer() {
    return new Promise((_, reject) => setTimeout(() => reject(new AssertionError(`example timeout (${this.timeout}ms) exceeded`)), this.timeout));
  }
}

module.exports = Example;
