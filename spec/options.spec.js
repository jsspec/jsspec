const Options = require('../src/options.js');
const Documentation = require('@jsspec/format/formatters/documentation');
const MyClass = require('./mock/to_require');

describe('Options', () => {
  subject('options', () => new Options(args));

  context('with valid arguments', () => {
    set('required', __dirname + '/mock/to_require.js');
    set('specFiles', ['some/spec/file.spec.js', 'some/spec/other_file.spec.js']);
    set('args', () => [`-r=${required}`, '-Rf', 'd'].concat(specFiles));

    it('has no errors', () => expect(subject.errors).to.be.empty);
 
    it('sets the reporter', () => {
      expect(subject.reporterClass).to.eql(Documentation);
    });

    context('with relative paths', () => {
      set('required', './spec/mock/to_require.js');

      it('has no errors', () => expect(subject.errors).to.be.empty);
    });

    context('with a bad relative path', () => {
      set('required', 'not/a/file.js');

      it('has an error', () => expect(subject.errors).to.have.length(1));
    });
 
    context('with a bad formatter', () => {
      set('format', 'not/a/file.js');
      set('args', () => [`-f=${format}`].concat(specFiles));

      it('has an error', () => expect(subject.errors).to.have.length(1));
      it('sets the formatter to default', () => expect(subject.reporterClass).to.eql(Documentation));
    });

    context('with a local formatter', () => {
      set('format', 'spec/mock/to_require.js');
      set('args', () => [`-f=${format}`].concat(specFiles));

      it('has an error', () => expect(subject.errors).to.be.empty);
      it('sets the formatter to the imported value', () => expect(new subject.reporterClass()).to.be.an.instanceOf(MyClass));
    });

    describe('.settings', () => {
      subject('settings', () => options.settings);

      it('applies the settings', () => {
        expect(subject.random).to.be.true;
        expect(subject.require).to.have.ordered.members([required]);
        expect(subject.files).to.have.ordered.members(specFiles);
      });
    });
  });
});
