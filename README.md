# JSSPEC
[![npm (scoped)](https://img.shields.io/npm/v/@jsspec/jsspec?logo=npm&style=for-the-badge)](https://www.npmjs.com/package/@jsspec/jsspec)
[![Travis](https://img.shields.io/travis/jsspec/jsspec/master.svg?logo=travis&style=for-the-badge)](https://travis-ci.org/jsspec/jsspec)
[![AppVeyor](https://img.shields.io/appveyor/ci/HookyQR/jsspec/master.svg?logo=appveyor&style=for-the-badge)](https://ci.appveyor.com/project/HookyQR/jsspec)

Contextualised spec runner for JavaScript in the flavour of `RSpec` (Ruby Spec runner).

See [JSSpec docs](https://jsspec.github.io/)


## eslint
There is an eslint plugin available which removes the 'is not defined' errors for variables defined in `set` and `subject` statements. Install with:

`npm i eslint-plugin-jsspec`

Add the following to your `.eslintrc.json` file in your spec directory:
```json
  "plugins": ["jsspec"],
  "env": {
    "jsspec/jsspec": true
  },
```

## Future work:
Runner:
* improved output for file level failures
* Concurrent runners

Associated modules:
* companion expectation framework
* doubles (mocks/spies)
* more formatters
