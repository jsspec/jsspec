'use strict';

const Runner = require('./runner');
const resolve = require('./utility/resolve');
const Rand = require('./utility/rand');

const { addHook } = require('pirates');

const emitter = {
  emit(message, ...data) { process.send([message, ...data]); }
};

const runner = async ({ settings, file, index }) => {
  addHook(
    (code, filename) => {
      emitter.emit('required', file.name, filename);
      return code;
    });

  Rand.seed(settings.seed);

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

  process.removeAllListeners();
  process.emit({result: !failed });
};

const handler = ({ kill, ...rest }) => {
  if(kill) { return process.removeAllListeners(); }
  runner(rest);
};

process.on('message', handler);
