'use strict';

const Runner = require('./runner');
const resolve = require('./utility/resolve');

const emitter = {
  emit(message, ...data) { process.send([message, ...data]); }
};

const runner = async ({ settings, file, index }) => {
  if (settings.require) {
    settings.require = settings.require.filter(
      // this doesn't need the catch block as the 
      // options filter will have removed any failed
      // files already
      requestedModule => require(resolve(requestedModule))
    );
  }
  const runner = new Runner(settings, file, index);
  const failed = await runner.run(emitter);

  process.exit(failed ? 1 : 0);
};

process.on('message', runner);
