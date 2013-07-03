(function() {
  var CancelResult, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  CancelResult = require('../../src/Delta/CancelResult');

  describe('CancelResult', function() {
    return it('should instantiate recording the supplied locked funds', function() {
      var cancelResult;
      cancelResult = new CancelResult({
        lockedFunds: 'hello'
      });
      return cancelResult.lockedFunds.should.equal('hello');
    });
  });

}).call(this);
