const Context = require('./context');

const lazyEvaluate = {
  set: false,
  subject: false,
};
const contextual = {
  context: false,
  describe: false,
  xcontext: false,
  xdescribe: false,
};

const execution = {
  it: false,
  xit: false,
  pend: false,
};

const executionHook = {
  beforeEach: false,
  afterEach: false,
  before: false,
  after: false,
};

const shared = {
  sharedExamples: false,
  itBehavesLike: false,
  sharedContext: false,
  includeContext: false,
};

const globals = Object.keys({
  ...lazyEvaluate,
  ...contextual,
  ...execution,
  ...executionHook,
  ...shared,
});

const injector = name => {
  const elements = require(`./global/${name}`);
  if (elements.initialise) Context.initialisers.push(elements.initialise);
  if (elements.instance) {
    for (const key in elements.instance) {
      Context.prototype[key] = elements.instance[key];
    }
  }
  if (elements.global instanceof Function) global[name] = elements.global.bind(Context);
  else if (elements.global) Object.defineProperty(global, name, elements.global);
};

globals.forEach(injector);
