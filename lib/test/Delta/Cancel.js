(function() {
  var Cancel, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Cancel = require('../../src/Delta/Cancel');

  describe('Cancel', function() {
    return it('should instantiate recording the supplied locked funds', function() {
      var cancel;

      cancel = new Cancel({
        lockedFunds: 'hello'
      });
      return cancel.lockedFunds.should.equal('hello');
    });
  });

}).call(this);
