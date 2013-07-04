(function() {
  var Submit, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Submit = require('../../src/Delta/Submit');

  describe('Submit', function() {
    return it('should instantiate recording the supplied locked funds, next higher order sequence and trades', function() {
      var submit;

      submit = new Submit({
        lockedFunds: 'hello',
        nextHigherOrderSequence: 'banana',
        trades: 'apple'
      });
      submit.lockedFunds.should.equal('hello');
      submit.nextHigherOrderSequence.should.equal('banana');
      return submit.trades.should.equal('apple');
    });
  });

}).call(this);
