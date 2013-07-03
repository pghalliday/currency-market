(function() {
  var WithdrawResult, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  WithdrawResult = require('../../src/Delta/WithdrawResult');

  describe('WithdrawResult', function() {
    return it('should instantiate recording the supplied funds', function() {
      var withdrawResult;
      withdrawResult = new WithdrawResult({
        funds: 'hello'
      });
      return withdrawResult.funds.should.equal('hello');
    });
  });

}).call(this);
