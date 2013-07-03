(function() {
  var WithdrawDelta, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  WithdrawDelta = require('../../src/Delta/WithdrawDelta');

  describe('WithdrawDelta', function() {
    return it('should instantiate recording the supplied funds', function() {
      var withdrawDelta;
      withdrawDelta = new WithdrawDelta({
        funds: 'hello'
      });
      return withdrawDelta.funds.should.equal('hello');
    });
  });

}).call(this);
