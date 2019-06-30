# JSSPEC

Contextualised spec runner for JavaScript in the flavour of `RSpec` (Ruby Spec runner).

## Why
This spec runner was written to enable easy context changing when writing specs for JavaScript. I've used Mocha and Jest in the past, and for me, the biggest annoyance was having to either write build methods, or repeated code when writing test. `JSSpec` solves that issue by allowing you to change only the parameter that is required to change to set a new context.

So instead of having to write:
```javascript
describe('MyClass.run', () => {
  context('when option.random is set', () => {
    it('runs in random order', () => {
      const thing = new MyClass({random: true, otherSetting: false});
      expect(thing.run()).to.eql('random');
    });
  });
  context('when option.random is not set', () => {
    it('does not run in random order', () => {
      const thing = new MyClass({random: false, otherSetting: false});
      expect(thing.run()).not.to.eql('random');
    });
  });
});
```

As can be done in `RSpec`, we can now make context changes when using `JSSpec`:
```javascript
describe('MyClass.run', () => {
  subject(() => myClass.run());

  set('myClass', () => new MyClass(options));
  set('options', () => ({ random, otherSetting: false }));

  context('when option.random is set', () => {
    set('random', true);

    it('runs in random order', () => {
      expect(subject).to.eql('random');
    });
  });

  context('when option.random is not set', () => {
    set('random', false);

    it('does not run in random order', () => {
      expect(subject).not.to.eql('random');
    });
  });
});
```

In this case, we define a subject when we open a describe block and prepare all of the values that are required to test it. Then, for each test context, we set only the component that relates to that context. Everything else is un-changed, so we don't have to mention it.

This improves readability and maintainability of the test code.

## Limitations
To provide this capability, the `set` and `subject` variables are defined on the global object. This means you run the risk of breaking the world if you choose the wrong variable names. But I'm sure this will just help you choose better names. ;)

The ecosystem is not yet complete. The system does not yet have before and after hooks.

Eventually there will be an expectation library to complement `JSSpec`. For now, `chai.expect` works fine.

Some of the output may be wonky, please report it via the `@jsspec/format` repo.

Currently only runs against full path names.

## Command
jsspec [options] files
  --random, -R     Flag to run tests in random order. Default: true
  --format, -f     Output formatter (currently only 'documentation'

## Use
The standard bits:

`describe` and `context` do the same thing:
`context(description, options, block)` or<br>
`context(description, block)`

Options is an object and currently only accepts `timeout`. A timeout of zero means run forever if it has to. The timeout is set for each child example block.

`it(description, options, block)` or<br>
`it(description, block)`

Again, same thing for options. Timeout set for this block only.

### `set(keyName, settting)`
Set is the lazy evaluator. The keyName must be a string, and the setting can be a value, or a function who's result will (eventually) be used as the value.
eg:
```javascript
/*
  test = 501
*/
set('test', 501)

/*
  other will resolve to the value of `test` when `other` 
  is first invoked in an example block
*/
set('other', () => test)

/*
  to set the value to a function, it has to be wrapped in another function, which is fine.
  The value of `other` will be what ever `other` is when `fn` is called.
*/
set(`fn`, () => ((...args) => doSomethingWith(other, args)))
```

The power of the lazy evaluation comes in to play when sub elements (like `test` is for `other` here) are re-set in a child context.

## `subject([optionalName], setting)`
`subject` is slightly special, it can be named just as variable in `set` are, but doesn't have to be. You can refer directly to `subject` in an example block. It's often handy to name a subject though, so you can change the subject further down in the same chain, but still refer to the original value.
```javascript
subject(() => new MyClass(options));

it('is a thing', () => {
  expect(subject).to.be.an.instanceOf(MyClass);
});
```

## Future work:
* before and after hooks
* Glob filename matching
* Targeted test running
* Concurrent runners
* File watch running
* companion expectation framework
* doubles (mocks/spies)
* more formatters
