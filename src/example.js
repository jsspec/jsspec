'use strict';

const locator = require("./locator");

class NonErrorError extends Error {
  toString() {
    return this.message;
  }
}
class AssertionError extends Error {}

class Example {
  constructor(description, kind, options, block, context) {
    const { timeout } = { timeout: 200, ...context, ...options };
    this.timeout = timeout;

    this.kind = kind;
    this.description = description;
    this.block = block;
    this.context = context;

    this._location = locator.location;
    this.stringError = new NonErrorError("");
    this.timeoutError = new AssertionError(`example timeout (${this.timeout}ms) exceeded`);
  }

  set failure(error) {
    this._failure = error;
  }

  get failure() {
    return this._failure;
  }

  toJSON() {
    return {
      description: this.description,
      fullDescription: this.fullDescription,
      location: this.location,
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
    return `${this.context.fullDescription} ${this.description}`.trimStart();
  }

  get location() {
    if (this.index) {
      return this._location.fileName + '[' + this.index.map(v => v + 1).join(':') + ']';
    }
    return this.unIndexedLocation;
  }

  get unIndexedLocation() {
    if (this._location && this._location.fileName) return this._location.fileName + ':' + this.line;
    return '';
  }

  get line() {
    return this._location.line;
  }

  async run() {
    try {
      if (this.timeout > 0) {
        const start = Date.now();
        return Promise.race([this.block(), this.timer()]).then(() => {
          // this is required for situations where the block provided is not async.
          // The block may not yield control to the event loop to enable the
          // timer to racing timer to trigger the timeout call.
          if (Date.now() > start + this.timeout) throw this.timeoutError;
        });
      }
      await this.block();
    } catch(e) {
      if(!e.stack) {
        this.stringError.message = e;
        throw this.stringError;
      }
      throw e;
    }
  }

  timer() {
    return new Promise((_, reject) => setTimeout(() => reject(this.timeoutError), this.timeout));
  }
}

module.exports = Example;
