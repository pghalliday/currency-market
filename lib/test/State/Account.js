(function() {
  var Account, Amount, Balance, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Account = require('../../src/State/Account');

  Balance = require('../../src/State/Balance');

  Amount = require('../../src/Amount');

  describe('Account', function() {
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
    return describe('JSON.stringify', function() {
      beforeEach(function() {
        var account, balanceBTC, balanceEUR;
        account = new Account();
        account.orders['hello'] = 'hello';
        balanceEUR = account.getBalance('EUR');
        balanceEUR.funds = new Amount('5000');
        balanceEUR.lockedFunds = new Amount('3000');
        balanceBTC = account.getBalance('BTC');
        balanceBTC.funds = new Amount('50');
        balanceBTC.lockedFunds = new Amount('25');
        return this.snapshot = JSON.parse(JSON.stringify(account));
      });
      it('should return a JSON string with a snapshot of the account balances without orders', function() {
        return expect(this.snapshot.orders).to.not.be.ok;
      });
      return it('should be possible to instantiate an account with the same balances from the snapshot', function() {
        var account;
        account = new Account(this.snapshot);
        account.getBalance('EUR').funds.compareTo(new Amount('5000')).should.equal(0);
        account.getBalance('EUR').lockedFunds.compareTo(new Amount('3000')).should.equal(0);
        account.getBalance('BTC').funds.compareTo(new Amount('50')).should.equal(0);
        account.getBalance('BTC').lockedFunds.compareTo(new Amount('25')).should.equal(0);
        return account.orders.should.deep.equal({});
      });
    });
  });

}).call(this);
