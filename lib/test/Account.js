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
        id: '123456789',
        timestamp: '987654321',
        currencies: ['EUR', 'USD', 'BTC']
      });
      account.id.should.equal('123456789');
      account.timestamp.should.equal('987654321');
      account.balances['EUR'].should.be.an.instanceOf(Balance);
      account.balances['USD'].should.be.an.instanceOf(Balance);
      return account.balances['BTC'].should.be.an.instanceOf(Balance);
    });
    it('should throw an error if no id is present', function() {
      var _this = this;

      return expect(function() {
        var account;

        return account = new Account({
          timestamp: '987654321',
          currencies: ['EUR', 'USD', 'BTC']
        });
      }).to["throw"]('Must supply transaction ID');
    });
    it('should throw an error if no timestamp is present', function() {
      var _this = this;

      return expect(function() {
        var account;

        return account = new Account({
          id: '123456789',
          currencies: ['EUR', 'USD', 'BTC']
        });
      }).to["throw"]('Must supply timestamp');
    });
    it('should throw an error if no currencies are present', function() {
      var _this = this;

      return expect(function() {
        var account;

        return account = new Account({
          id: '123456789',
          timestamp: '987654321'
        });
      }).to["throw"]('Must supply currencies');
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.account = new Account({
          id: '123456789',
          timestamp: '987654321',
          key: 'Peter',
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
          id: '123456789',
          timestamp: '987654321',
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
          id: '123456790',
          timestamp: '987654321',
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
      it('should return false if the timestamps are different', function() {
        var account;

        account = new Account({
          id: '123456789',
          timestamp: '987654322',
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
          id: '123456789',
          timestamp: '987654322',
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
          id: '123456789',
          timestamp: '987654322',
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
          id: '123456789',
          timestamp: '987654322',
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
          id: '123456789',
          timestamp: '987654322',
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
