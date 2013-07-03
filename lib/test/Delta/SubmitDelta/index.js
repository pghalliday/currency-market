(function() {
  var SubmitDelta, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  SubmitDelta = require('../../../src/Delta/SubmitDelta');

  describe('SubmitDelta', function() {
    return it('should instantiate recording the supplied locked funds, next higher order sequence and trades', function() {
      var submitDelta;
      submitDelta = new SubmitDelta({
        lockedFunds: 'hello',
        nextHigherOrderSequence: 'banana',
        trades: 'apple'
      });
      submitDelta.lockedFunds.should.equal('hello');
      submitDelta.nextHigherOrderSequence.should.equal('banana');
      return submitDelta.trades.should.equal('apple');
    });
  });

}).call(this);
