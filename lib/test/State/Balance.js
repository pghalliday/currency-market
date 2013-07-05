(function() {
  var Amount, Balance, chai;

  chai = require('chai');

  chai.should();

  Balance = require('../../src/State/Balance');

  Amount = require('../../src/Amount');

  describe('Balance', function() {
    it('should instantiate with default funds and locked funds of 0', function() {
      var balance;
      balance = new Balance();
      balance.funds.compareTo(Amount.ZERO).should.equal(0);
      return balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
    });
    return it('should instantiate from a known state', function() {
      var balance;
      balance = new Balance({
        funds: '5000',
        lockedFunds: '3000'
      });
      balance.funds.compareTo(new Amount('5000')).should.equal(0);
      return balance.lockedFunds.compareTo(new Amount('3000')).should.equal(0);
    });
  });

}).call(this);
