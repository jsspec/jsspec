'use strict';

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
    const { timeout, random } = {timeout: 200, ...(parent || {}), ...options};
    this.timeout = timeout;
    this.random = random;
    this.description = description;
    this.contextBlock = contextBlock;
    this.children = [];

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

  close() {
    this.children.forEach(child => child.close());
    this.children = [];
  }

  addChild(child) {
    child.id = this.id + ':' + this.children.push(child);
  }

  async runChildren() {
    const order = Object.keys(this.children);
    if (this.random) {
      order.sort(() => Math.random() - 0.5);
    }

    for (let i = 0; i < this.children.length; i++) {
      currentContext = this.children[order[i]];
      await currentContext.run();
    }
    currentContext = this;
  }

  prepare() {
    currentContext = this;
    this.contextBlock.call();
    currentContext = this.parent;
  }

  async run() {
    baseContext.emitter.emit('contextStart', this.id, this.constructor.name, this.description);
    if (!this.constructor.name.startsWith('X')) {
      const order = Object.keys(this.examples);

      if (this.random) {
        order.sort(() => Math.random() - 0.5);
      }
      this.runBeforeHooks();
      for (let i = 0; i < order.length; i++) {
        await this.runExample(this.examples[order[i]]);
      }
      this.runAfterHooks();
      await this.runChildren();
    }
    baseContext.emitter.emit('contextEnd', this.id);
  }
  get emitter() {
    return baseContext._emitter;
  }

  set emitter(emitter) {
    this._emitter = emitter;
  }
  runBeforeEach() {}
  runAfterEach() {}
  runBeforeHooks() {}
  runAfterHooks() {}

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
