(function() {
  var Amount, Balance, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  describe('Balance', function() {
    it('should instantiate with funds of zero and locked funds of zero', function() {
      var balance;

      balance = new Balance();
      balance.funds.compareTo(Amount.ZERO).should.equal(0);
      return balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
    });
    describe('#deposit', function() {
      return it('should add the deposited amount to the funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.funds.compareTo(new Amount('200')).should.equal(0);
        balance.deposit(new Amount('150'));
        return balance.funds.compareTo(new Amount('350')).should.equal(0);
      });
    });
    describe('#lock', function() {
      it('should add the offer amount to the locked funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('50'));
        balance.lockedFunds.compareTo(new Amount('50')).should.equal(0);
        balance.lock(new Amount('100'));
        return balance.lockedFunds.compareTo(new Amount('150')).should.equal(0);
      });
      return it('should throw an error if the there are not enough funds available to satisfy the lock', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('100'));
        return expect(function() {
          return balance.lock(new Amount('150'));
        }).to["throw"]('Cannot lock funds that are not available');
      });
    });
    describe('#unlock', function() {
      it('should subtract the offer amount from the locked funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('200'));
        balance.unlock(new Amount('100'));
        balance.lockedFunds.compareTo(new Amount('100')).should.equal(0);
        balance.unlock(new Amount('50'));
        return balance.lockedFunds.compareTo(new Amount('50')).should.equal(0);
      });
      return it('should throw an error if the there are not enough funds locked to unlock', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('200'));
        balance.unlock(new Amount('100'));
        balance.lockedFunds.compareTo(new Amount('100')).should.equal(0);
        return expect(function() {
          return balance.unlock(new Amount('150'));
        }).to["throw"]('Cannot unlock funds that are not locked');
      });
    });
    return describe('#withdraw', function() {
      it('should subtract the withdrawn amount from the funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('50'));
        balance.lockedFunds.compareTo(new Amount('50')).should.equal(0);
        balance.lock(new Amount('100'));
        balance.withdraw(new Amount('25'));
        balance.funds.compareTo(new Amount('175')).should.equal(0);
        balance.withdraw(new Amount('25'));
        return balance.funds.compareTo(new Amount('150')).should.equal(0);
      });
      return it('should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(new Amount('200'));
        balance.lock(new Amount('50'));
        balance.lockedFunds.compareTo(new Amount('50')).should.equal(0);
        balance.lock(new Amount('100'));
        return expect(function() {
          return balance.withdraw(new Amount('100'));
        }).to["throw"]('Cannot withdraw funds that are not available');
      });
    });
  });

}).call(this);