'use strict';

const locator = require('./locator');

let currentContext;
let baseContext;

const callOnMe = function(method) { method.call(this); };

class Context {
  constructor(description = '', options = {}, contextBlock, parent) {
    if (parent) {
      if (parent.executing) throw ReferenceError('A context block can not be defined inside an example');
      parent.addChild(this);
      this.parent = parent;
    }
    const { timeout, random, line, runIndex } = { timeout: 200, ...(parent || {}), ...options };
    if (runIndex) {
      this.runIndex = [...runIndex];
      const first = this.runIndex.shift();
      if (this.runIndex.length) {
        this.contextIndex = first;
      } else {
        delete this.runIndex;
        this.exampleIndex = first;
      }
    }
    this._location = locator.location;

    this.line = line;
    this.timeout = timeout;
    this.random = random;
    this.description = description;
    this.contextBlock = contextBlock;
    this.children = [];
    this.failed = false;
    Context.initialisers.map(callOnMe, this);
  }

  get fullDescription() {
    if (this.parent) return this.parent.fullDescription + ' ' + this.description;
    return this.description;
  }

  index(child) {
    let index = [];
    if (this.parent) { index = this.parent.index(this); }
    if (child) index.push(this.children.indexOf(child));
    return index;
  }

  addChild(child) {
    child.id = this.id + ':' + this.children.push(child);
  }

  selectedContexts() {
    let selected;
    if (this.line) {
      let i = this.children.length;
      while (i--) {
        if (this.children[i]._location.line <= this.line) break;
      }
      selected = [i];
    } else if ('contextIndex' in this) {
      selected = [this.contextIndex];
    } else if ('exampleIndex' in this) {
      selected = [];
    } else {
      selected = Object.keys(this.children);
    }

    if (selected[0] >= this.children.length || selected[0] < 0) return [];
    return selected;
  }

  async runChildren() {
    let selected = this.selectedContexts();
    if (this.random) {
      selected.sort(() => Math.random() - 0.5);
    }
    let count = 0;
    for (let i = 0; i < selected.length; i++) {
      currentContext = this.children[selected[i]];
      count += await currentContext.run();
      this.failed = this.failed || currentContext.failed;
    }
    currentContext = this;
    return count;}

  selectedExamples() {
    let selected;
    if ('contextIndex' in this) {
      selected = []; // need to go deeper
    } else if (this.line) {
      selected = [this.examples.findIndex(({ line }) => line === this.line)];
    } else if ('exampleIndex' in this) {
      // this has to be an indexed example
      selected = [this.examples.findIndex(({ index }) => index && this.exampleIndex === index[index.length - 1])];
    } else {
      selected = Object.keys(this.examples);
    }
    if (selected[0] < 0 || selected[0] > this.examples.length) selected = [];
    return selected;
  }

  async run() {
    this.contextBlock.call();
    const selected = this.selectedExamples();

    let count = 0;
    let failed = false;

    baseContext.emitter.emit('contextStart', this);
    if (!this.constructor.name.startsWith('X')) {
      if (this.random) {
        selected.sort(() => Math.random() - 0.5);
      }
      for (let i = 0; i < selected.length; i++) {
        failed = await this.runExample(this.examples[selected[i]]) || failed;
      }

      count = await this.runChildren() + selected.length;
      if (count) await this.runAfterHooks();
    }
    this.failed = failed;
    baseContext.emitter.emit('contextEnd', this);
    return count;}

  get kind() {
    return this.constructor.name;
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      fullDescription: this.fullDescription,
      kind: this.kind,
      base: this.base,
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
    if (this.parent) return this.parent.base;
    return this.id;
  }
  get emitter() {
    return baseContext._emitter;
  }

  set emitter(emitter) {
    this._emitter = emitter;
  }

  static begin(emitter, file, options) {
    baseContext = currentContext = new Context('', options);
    baseContext.id = file;
    baseContext.emitter = emitter;
    return baseContext;
  }

  static get currentContext() {
    return currentContext;
  }
}

Context.initialisers = [];

module.exports = Context;
