const Context = require('./context');

const lazyEvaluate = {
  set: false,
  subject: false
};
const contextual = {
  context: false,
  describe: false,
  xcontext: false,
  xdescribe: false,
};

const execution = {
  it: false,
  // xit: false,
  // pend: false,
  // expect: false,
  // is_expected: false
};

const executionHook = {
  // beforeEach: false,
  // afterEach: false,
  // before: false,
  // after: false
};

const shared = {
  // sharedExample: false,
  // itBehavesLike: false
};

const errorProcessing = {
  error: false
};

const globals = Object.keys({
  ...lazyEvaluate,
  ...contextual,
  ...execution,
  ...executionHook,
  ...shared,
  ...errorProcessing
});

const injector = name => {
  const elements = require(`./global/${name}`);
  if (elements.initialise) Context.initialisers.push(elements.initialise);
  if (elements.instance) {
    for (const key in elements.instance) {
      Context.prototype[key] = elements.instance[key];
    }
  }
  if (elements.global instanceof Function) {
    global[name] = elements.global.bind(Context);
  } else if (elements.global) {
    Object.defineProperty(global, name, {
      configurable: true,
      get() {
        if(Context.currentContext.executing && elements.global.executeGet) {
          return elements.global.executeGet.call(Context);
        }
        return elements.global.build.bind(Context);
      },
      set(value){
        if(Context.currentContext.executing) {
          return elements.global.executeSet.call(Context, value);
        }
        // else throw
      }
    });
  }
};

globals.forEach(injector);
