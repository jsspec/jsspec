const { expect } = require('chai');

describe('crap', () => {
  set('first', {
    thing: {
      thing: {
        thing: {
          thing: {
            thing: {
              thing: {
                thing: {
                  thing: {
                    thing: {
                      thing: {
                        thing: {
                          thing: {
                            thing: {
                              thing: {
                                thing: {
                                  thing: {
                                    thing: 'this string is different  here'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  set('second', {
    thing: {
      thing: {
        thing: {
          thing: {
            thing: {
              thing: {
                thing: {
                  thing: {
                    thing: {
                      thing: {
                        thing: {
                          thing: {
                            thing: {
                              thing: {
                                thing: {
                                  thing: {
                                    thing: 'this string is different now here'
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  it('breaks', {timeout: 100}, () => {
    // expect(first).to.eql(second);
    return new Promise(res => setTimeout(res, 10000));
  });
});

describe('loop', () => {
  [1, 2, 3].forEach(vv => {
    context('depth ' + vv, () => [1, 2, 3].forEach(v => {
      it(`has ${v}`, () => {
        expect(v).to.eq(2);
      });
    }));
  });
});
