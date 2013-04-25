(function() {
  var Account, Amount, Balance, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  describe('Account', function() {
    it('should instantiate with a collection of balances matching the supported currencies', function() {
      var account;

      account = new Account({
        id: 'Peter',
        currencies: ['EUR', 'USD', 'BTC']
      });
      account.balances['EUR'].should.be.an.instanceOf(Balance);
      account.balances['USD'].should.be.an.instanceOf(Balance);
      return account.balances['BTC'].should.be.an.instanceOf(Balance);
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        this.account.balances['EUR'].deposit(new Amount('300'));
        this.account.balances['EUR'].lock(new Amount('100'));
        this.account.balances['USD'].deposit(new Amount('200'));
        this.account.balances['USD'].lock(new Amount('50'));
        this.account.balances['BTC'].deposit(new Amount('50'));
        return this.account.balances['BTC'].lock(new Amount('25'));
      });
      it('should return true if 2 accounts are equal', function() {
        var account;

        account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        return this.account.equals(account).should.be["true"];
      });
      it('should return false if the ids are different', function() {
        var account;

        account = new Account({
          id: 'Paul',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        return this.account.equals(account).should.be["false"];
      });
      return it('should return false if a balance is different', function() {
        var account;

        account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('50'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('150'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('50'));
        return this.account.equals(account).should.be["false"];
      });
    });
    return describe('#export', function() {
      return it('should export the state of the account as a JSON stringifiable object that can be used to initialise a new Account in the exact same state', function() {
        var account, json, newAccount, state;

        account = new Account({
          id: 'Peter',
          currencies: ['EUR', 'USD', 'BTC']
        });
        state = account["export"]();
        json = JSON.stringify(state);
        newAccount = new Account({
          state: JSON.parse(json)
        });
        return newAccount.equals(account).should.be["true"];
      });
    });
  });

}).call(this);
