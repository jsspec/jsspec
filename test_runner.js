require('child_process')
  .fork('./bin/jsspec', [
    "-r",
    "chai/register-expect",
    "-R",
    "spec/*.spec.js"
  ]);