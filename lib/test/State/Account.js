(function() {
  var Account, Balance, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Account = require('../../src/State/Account');

  Balance = require('../../src/State/Balance');

  describe('Account', function() {
    it('should instantiate', function() {
      var account;
      account = new Account();
      return account.should.be.ok;
    });
    describe('#getBalance', function() {
      it('should create a new balance if it does not exist', function() {
        var account, balance;
        account = new Account();
        balance = account.getBalance('EUR');
        return balance.should.be.an.instanceOf(Balance);
      });
      it('should return the corresponding balance if it does exist', function() {
        var account, balance1, balance2;
        account = new Account();
        balance1 = account.getBalance('EUR');
        balance2 = account.getBalance('EUR');
        return balance2.should.equal(balance1);
      });
      return it('should return different balances for different IDs', function() {
        var account, balanceBTC, balanceEUR;
        account = new Account();
        balanceEUR = account.getBalance('EUR');
        balanceBTC = account.getBalance('BTC');
        return balanceBTC.should.not.equal(balanceEUR);
      });
    });
    return it('should instantiate from a known state', function() {
      var account;
      account = new Account({
        balances: {
          'EUR': {
            funds: '5000',
            lockedFunds: '3000'
          },
          'BTC': {
            funds: '50',
            lockedFunds: '25'
          }
        }
      });
      account.getBalance('EUR').getFunds().should.equal('5000');
      account.getBalance('EUR').getLockedFunds().should.equal('3000');
      account.getBalance('BTC').getFunds().should.equal('50');
      return account.getBalance('BTC').getLockedFunds().should.equal('25');
    });
  });

}).call(this);
