(function() {
  var Account, Amount, Balance, Order, amount10, amount100, amount1000, amount15, amount5, amount500, amountPoint01, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  amountPoint01 = new Amount('0.01');

  amount5 = new Amount('5');

  amount10 = new Amount('10');

  amount15 = new Amount('15');

  amount100 = new Amount('100');

  amount500 = new Amount('500');

  amount1000 = new Amount('1000');

  describe('Account', function() {
    it('should instantiate with collections of orders and balances matching the supported currencies', function() {
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
      account.balances['BTC'].should.be.an.instanceOf(Balance);
      return Object.keys(account.orders).should.be.empty;
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
          currencies: ['EUR', 'USD', 'BTC']
        });
        this.account.balances['EUR'].deposit(new Amount('300'));
        this.account.balances['EUR'].lock(new Amount('100'));
        this.account.balances['USD'].deposit(new Amount('200'));
        this.account.balances['USD'].lock(new Amount('50'));
        this.account.balances['BTC'].deposit(new Amount('50'));
        this.account.balances['BTC'].lock(new Amount('25'));
        return this.account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
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
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.equals(this.account).should.be["true"];
        return this.account.equals(account).should.be["true"];
      });
      it('should return false if the ids are different', function() {
        var account;

        account = new Account({
          id: '123456790',
          timestamp: '987654321',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        account.equals(this.account).should.be["false"];
        return this.account.equals(account).should.be["false"];
      });
      it('should return false if the timestamps are different', function() {
        var account;

        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        account.equals(this.account).should.be["false"];
        return this.account.equals(account).should.be["false"];
      });
      it('should return false if the orders are different', function() {
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
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('1')
        });
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
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
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.orders['2'] = new Order({
          id: '2',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.equals(this.account).should.be["false"];
        return this.account.equals(account).should.be["false"];
      });
      return it('should return false if a balance is different', function() {
        var account;

        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('50'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('150'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('25'));
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.balances['EUR'].deposit(new Amount('300'));
        account.balances['EUR'].lock(new Amount('100'));
        account.balances['USD'].deposit(new Amount('200'));
        account.balances['USD'].lock(new Amount('50'));
        account.balances['BTC'].deposit(new Amount('50'));
        account.balances['BTC'].lock(new Amount('50'));
        account.equals(this.account).should.be["false"];
        return this.account.equals(account).should.be["false"];
      });
    });
    describe('#submit', function() {
      it('should add an order to the orders collection and lock the appropriate funds', function() {
        var account, order;

        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(new Amount('1000'));
        order = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
        });
        account.submit(order);
        account.orders['1'].should.equal(order);
        return account.balances['EUR'].lockedFunds.compareTo(amount1000).should.equal(0);
      });
      return describe('when the order fill event fires', function() {
        beforeEach(function() {
          this.account = new Account({
            id: '123456789',
            timestamp: '987654322',
            currencies: ['EUR', 'USD', 'BTC']
          });
          this.account.balances['EUR'].deposit(new Amount('1000'));
          this.order = new Order({
            id: '1',
            timestamp: '1',
            account: '123456789',
            offerCurrency: 'EUR',
            bidCurrency: 'BTC',
            bidPrice: amount100,
            bidAmount: amount10
          });
          return this.account.submit(this.order);
        });
        it('should adjust the locked funds', function() {
          var order;

          order = new Order({
            id: '2',
            timestamp: '2',
            account: '12345523',
            offerCurrency: 'BTC',
            bidCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount5
          });
          order.match(this.order);
          this.account.orders['1'].should.equal(this.order);
          return this.account.balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
        });
        return it('should delete fully filled orders', function() {
          var order;

          order = new Order({
            id: '2',
            timestamp: '2',
            account: '12345523',
            offerCurrency: 'BTC',
            bidCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount15
          });
          order.match(this.order);
          expect(this.account.orders['1']).to.not.be.ok;
          return this.account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
        });
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
        account.orders['1'] = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: new Amount('100'),
          bidAmount: new Amount('10')
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
