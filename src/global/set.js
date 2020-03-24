'use strict';
const Context = require('../context');

let computedValues = new Map();
let globalisedKeys = new Set();

const globaliseKey = (key) => {
  if (globalisedKeys.has(key) || (key in global)) return;

  globalisedKeys.add(key);
  if (!key) return;

  Object.defineProperty(global, key, {
    configurable: true,
    get: () => {
      if (computedValues.has(key)) return computedValues.get(key);

      const value = Context.currentContext.compute(key);
      computedValues.set(key, value);
      return value;
    },

    set: value => {
      const context = Context.currentContext;
      if (!context.executing) {
        throw ReferenceError('A variable assigned via set may not be directly assigned to outside of an Example');
      }
      computedValues.set(key, value);
      return value;
    }
  });
};

const clearGlobalKeys = () => {
  clearGlobalValues();
  globalisedKeys.forEach(key => delete global[key]);
  globalisedKeys.clear();
};

const clearGlobalValues = () => {
  computedValues.clear();
};

module.exports = {
  initialise() {
    this.values = new Map();
  },
  instance: {
    addDefinition(key, valueOrCreator) {
      if (typeof key !== 'string' && key !== null) {
        throw TypeError('Target for `set` must be a string');
      }

      this.values.set(key, valueOrCreator);
      globaliseKey(key);
    },

    retrieveCreator(key) {
      if (this.values.has(key)) return this.values.get(key);
      return this.parent.retrieveCreator(key);
    },

    reset() {
      clearGlobalKeys();
    },

    startBlock() {
      this.setTreeExecution(true);
    },
    endBlock() {
      clearGlobalValues();
      this.setTreeExecution(false);
    },

    compute(key) {
      if (!this.executing) {
        throw ReferenceError('accessing lazy evaluators is allowed only within an example block');
      }

      let creatorOrValue = this.retrieveCreator(key);
      if (creatorOrValue instanceof Function &&
        // a class isn't callable
        !creatorOrValue.toString().startsWith('class')
      ) {
        return creatorOrValue();
      }
      return creatorOrValue;
    }
  },
  global(key, value) {
    if (this.executing) throw new ReferenceError('Setting lazy evaluators within a running context is not permitted');

    this.currentContext.addDefinition(key, value);
  }
};
