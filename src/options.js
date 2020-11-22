const Options = require('@jsspec/cli-options');
const formatters = require('@jsspec/format');
const resolve = require('./utility/resolve');
const { looseSeed } = require('./utility/rand');

const jsSpecCLIOptions = {
  random: { alias: 'R', type: Boolean, required: false, default: true },
  seed: { alias: 's', type: Number, required: false },
  require: { alias: 'r', type: Array, required: false, default: [] },
  format: { alias: 'f', type: String, required: false, default: 'documentation' },
  timeout: { alias: 't', type: Number, required: false, default: 200 },
  watch: { alias: 'w', type: Boolean, required: false, default: false },
  bland: { alias: 'b', type: Boolean, required: false, default: false },
  files: { type: Array, required: false, default: ['spec/**/*.spec.js'] },
};

class JSSpecOptions {
  constructor(args) {
    this.options = new Options(args, jsSpecCLIOptions, 'files');
    this.settings = this.options.settings;

    if (this.settings.seed) {
      this.settings.random = true;
    } else if (this.settings.random) {
      this.settings.seed = looseSeed();
    }

    this.errors = this.options.errors;
    try {
      this.reporterClass = formatters[this.options.settings.format] || require(resolve(this.options.settings.format));
    } catch (error) {
      this.reporterClass = formatters.documentation;
      this.errors.push(error);
    }
    this.options.settings.require = this.options.settings.require.filter(requestedModule => {
      try {
        require(resolve(requestedModule));
        return true;
      } catch (error) {
        this.errors.push(error);
      }
    });
  }
}

module.exports = JSSpecOptions;
