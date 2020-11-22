const path = require('path');

const resolve = file => {
  try {
    return require.resolve(file, { paths: [process.cwd()] });
  } catch (error) {
    if (!error.message.includes(`Cannot find module '${file}'`)) throw error;
    if (path.isAbsolute(file)) return file;
    return path.join(process.cwd(), file);
  }
};

module.exports = resolve;
