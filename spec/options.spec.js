const Options = require('../src/options.js');
const Documentation = require('@jsspec/format/formatters/documentation');
const expect = require('chai').expect;
describe('Options', () => {
  subject('options', () => new Options(args));

  context('with valid arguments', () => {
    set('required', __dirname + '/mock/to_require.js');
    set('specFiles', ['some/spec/file.spec.js', 'some/spec/other_file.spec.js']);
    set('args', () => [`-r=${required}`, '-Rf', 'd'].concat(specFiles));

    it('has no errors', () => expect(subject.errors).to.be.empty);
    it('sets the reporter', () => {
      expect(subject.reporterClass).to.be.an.instanceOf(Function);
      expect(subject.reporterClass).to.eql(Documentation);
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
