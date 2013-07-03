(function() {
  var SubmitResult, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  SubmitResult = require('../../../src/Delta/SubmitResult');

  describe('SubmitResult', function() {
    return it('should instantiate recording the supplied locked funds, next higher order sequence and trades', function() {
      var submitResult;
      submitResult = new SubmitResult({
        lockedFunds: 'hello',
        nextHigherOrderSequence: 'banana',
        trades: 'apple'
      });
      submitResult.lockedFunds.should.equal('hello');
      submitResult.nextHigherOrderSequence.should.equal('banana');
      return submitResult.trades.should.equal('apple');
    });
  });

}).call(this);
