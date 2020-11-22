describe('assignment to existing global', () => {
  set('clearInterval', 1);
  it('does not run this spec', () => {
    expect(clearInterval).to.eq(1);
  });
});
