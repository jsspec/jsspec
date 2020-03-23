'use strict';

const Context = require('../context');

const UNSET = Symbol.for('unset');

const settings = {
  initialise() {
    this.subject = UNSET;
  },
  instance: {
    setSubject(key, valueOrCreator) {
      this.addDefinition(key, valueOrCreator);
      this.subject = key;
    },

    retrieveSubject() {
      if (this.subject === UNSET) return this.parent.retrieveSubject();
      if (this.subject) return global[this.subject];
      return this.compute(null);
    }
  },
  global: {
    configurable: false,
    get() {
      const context = Context.currentContext;
      if(context.executing) {
        if ('subjectValue' in context) return context.subjectValue;
        return context.subjectValue = context.retrieveSubject();
      }
      return (...args) => args.length > 1 ?
        context.setSubject(...args) :
        context.setSubject(null, ...args);
    },
    set(value){
      if(Context.executing) return Context.currentContext.subjectValue = value;

      throw new ReferenceError('`subject` is assignable only inside an example block');
    }
  }
};


module.exports = settings;
