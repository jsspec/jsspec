const Options = require('@jsspec/cli-options');
const formatters = require('@jsspec/format');
const path = require('path');

const requireFromCwd = file => {
  const cwd = process.cwd();
  if (file.startsWith('.')) return require(path.join(cwd, file));
  else {
    try {
      return require(require.resolve(file, { paths: [cwd] }));
    }catch (error) {
      if (!error.message.includes(`Cannot find module '${file}'`)) throw error;

      return require(path.join(cwd, file));
    }
  }
};

const jsSpecCLIOptions = {
  random: { alias: 'R', type: Boolean, required: false, default: true },
  require: { alias: 'r', type: Array, required: false, default: [] },
  format: { alias: 'f', type: String, required: false, default: 'documentation' },
  timeout: { alias: 't', type: Number, required: false, default: 200 },
  files: { type: Array, required: false, default: ['spec/**/*.spec.js'] }
};

class JSSpecOptions {
  constructor(args) {
    this.options = new Options(args, jsSpecCLIOptions, 'files');
    this.settings = this.options.settings;
    this.errors = this.options.errors;
    try {
      this.reporterClass = formatters[this.options.settings.format] || requireFromCwd(this.options.settings.format);
    }catch (error) {
      this.reporterClass = formatters.documentation;
      this.errors.push(error);
    }

    this.options.settings.require = this.options.settings.require.filter(
      requestedModule => {
        try {
          requireFromCwd(requestedModule);
          return true;
        }catch (error) {
          this.errors.push(error);
        }
      }
    );
  }
}

module.exports = JSSpecOptions;
