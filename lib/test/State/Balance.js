(function() {
  var Balance, chai;

  chai = require('chai');

  chai.should();

  Balance = require('../../src/State/Balance');

  describe('Balance', function() {
    it('should instantiate with default funds and locked funds of 0', function() {
      var balance;

      balance = new Balance();
      balance.funds.should.equal('0');
      return balance.lockedFunds.should.equal('0');
    });
    return it('should instantiate from a known state', function() {
      var balance;

      balance = new Balance({
        funds: '5000',
        lockedFunds: '3000'
      });
      balance.funds.should.equal('5000');
      return balance.lockedFunds.should.equal('3000');
    });
  });

}).call(this);
