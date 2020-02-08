const child = require('child_process')
  .fork('./bin/jsspec', [
    "-r",
    "chai/register-expect",
    "-R",
    "spec/*.spec.js"
  ]);

child.on("close", code => process.exit(code));
