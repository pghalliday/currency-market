(function() {
  var Balance, chai;

  chai = require('chai');

  chai.should();

  Balance = require('../../src/State/Balance');

  describe('Balance', function() {
    it('should instantiate with default funds and locked funds of 0', function() {
      var balance;
      balance = new Balance();
      balance.getFunds().should.equal('0');
      return balance.getLockedFunds().should.equal('0');
    });
    describe('#setFunds', function() {
      return it('should set the funds to the given amount', function() {
        var balance;
        balance = new Balance();
        balance.setFunds('100');
        balance.getFunds().should.equal('100');
        balance.setFunds('200');
        return balance.getFunds().should.equal('200');
      });
    });
    describe('#setLockedFunds', function() {
      return it('should set the locked funds to the given amount', function() {
        var balance;
        balance = new Balance();
        balance.setLockedFunds('100');
        balance.getLockedFunds().should.equal('100');
        balance.setLockedFunds('200');
        return balance.getLockedFunds().should.equal('200');
      });
    });
    return it('should instantiate from a known state', function() {
      var balance;
      balance = new Balance({
        funds: '5000',
        lockedFunds: '3000'
      });
      balance.getFunds().should.equal('5000');
      return balance.getLockedFunds().should.equal('3000');
    });
  });

}).call(this);
