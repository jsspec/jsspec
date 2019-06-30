'use strict';

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
      if (this.subject === UNSET) {
        if (this.parent) return this.parent.retrieveSubject();

        throw ReferenceError('Subject is not defined in this context');
      }
      return this.compute(this.subject);
    }
  },
  global: {
    build(...args) {
      if (args.length > 1)
        return this.currentContext.setSubject(...args);
      return this.currentContext.setSubject(null, ...args);
    },
    executeGet() {
      if ('subjectValue' in this.currentContext) return this.currentContext.subjectValue;
      return this.currentContext.retrieveSubject();
    },
    executeSet(value) {
      return this.currentContext.subjectValue = value;
    }
  }
};


module.exports = settings;
