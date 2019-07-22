'use strict';

describe('named subject', () => {
  subject('testedObject', () => {
    return {};
  });

  sharedExamples('the same object', () => {
    it('both refer to the same object', () => {
      expect(subject).to.eql(testedObject);
      subject.content = 'some value';
      expect(subject.content).to.eql(testedObject.content);
    });
  });

  describe('assigning to subject', () => {
    itBehavesLike('the same object');

    it('becomes its own object', () => {
      subject = {nothingImportant: true};
      expect(subject).not.to.eql(testedObject);
      expect(testedObject.nothingImportant).to.be.undefined;
      expect(subject.nothingImportant).to.be.true;
    });
  });


  describe('assigning to object', () => {
    itBehavesLike('the same object');

    context('after subject has been referred to', () => {
      beforeEach(() => expect(subject).to.eql(testedObject));

      it('is still accessible as the subject', () => {
        testedObject = {nothingImportant: true};
        expect(subject).not.to.eql(testedObject);
        expect(subject.nothingImportant).to.be.undefined;
        expect(testedObject.nothingImportant).to.be.true;
      });
    });


    context('before subject has been referred to', () => {
      it('is still accessible as the subject', () => {
        testedObject = {nothingImportant: true};
        expect(subject).to.eql(testedObject);
        expect(subject.nothingImportant).to.be.true;
        expect(testedObject.nothingImportant).to.be.true;
      });
    });
  });
});
