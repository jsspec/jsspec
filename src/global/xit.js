'use strict';

module.exports = {
  global(description, executionBlock) {
    this.currentContext.addExecutor(description, executionBlock);
  }
};
