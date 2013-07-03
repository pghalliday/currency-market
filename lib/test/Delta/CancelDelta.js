(function() {
  var CancelDelta, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  CancelDelta = require('../../src/Delta/CancelDelta');

  describe('CancelDelta', function() {
    return it('should instantiate recording the supplied locked funds', function() {
      var cancelDelta;
      cancelDelta = new CancelDelta({
        lockedFunds: 'hello'
      });
      return cancelDelta.lockedFunds.should.equal('hello');
    });
  });

}).call(this);
