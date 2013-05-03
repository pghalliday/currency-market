(function() {
  var Account, Amount, Balance, Order, amount10, amount100, amount1000, amount15, amount150, amount200, amount25, amount300, amount5, amount50, amount500, amountPoint01, assert, chai, expect, newBid, newOffer;

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

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount100 = new Amount('100');

  amount150 = new Amount('150');

  amount200 = new Amount('200');

  amount300 = new Amount('300');

  amount500 = new Amount('500');

  amount1000 = new Amount('1000');

  newOffer = function(id, currency, amount) {
    return new Order({
      id: id,
      timestamp: '987654321',
      account: 'name',
      bidCurrency: 'EUR',
      offerCurrency: currency,
      offerAmount: amount,
      offerPrice: amount100
    });
  };

  newBid = function(id, currency, amount) {
    return new Order({
      id: id,
      timestamp: '987654321',
      account: 'name',
      bidCurrency: currency,
      offerCurrency: 'EUR',
      bidAmount: amount,
      bidPrice: amount150
    });
  };

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
        this.account.balances['EUR'].deposit(amount300);
        this.account.submit(newOffer('1', 'EUR', amount100));
        this.account.balances['USD'].deposit(amount200);
        this.account.submit(newOffer('2', 'USD', amount50));
        this.account.balances['BTC'].deposit(amount50);
        return this.account.submit(newOffer('3', 'BTC', amount25));
      });
      it('should return true if 2 accounts are equal', function() {
        var account;

        account = new Account({
          id: '123456789',
          timestamp: '987654321',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount100));
        account.balances['USD'].deposit(amount200);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.submit(newOffer('3', 'BTC', amount25));
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
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount100));
        account.balances['USD'].deposit(amount200);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.submit(newOffer('3', 'BTC', amount25));
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
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount100));
        account.balances['USD'].deposit(amount200);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.submit(newOffer('3', 'BTC', amount25));
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
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount100));
        account.balances['USD'].deposit(amount200);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account.submit(newOffer('3', 'BTC', amount50));
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
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount50));
        account.balances['USD'].deposit(amount200);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.submit(newOffer('3', 'BTC', amount25));
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(amount300);
        account.submit(newOffer('1', 'EUR', amount100));
        account.balances['USD'].deposit(amount150);
        account.submit(newOffer('2', 'USD', amount50));
        account.balances['BTC'].deposit(amount50);
        account.submit(newOffer('3', 'BTC', amount25));
        account.equals(this.account).should.be["false"];
        this.account.equals(account).should.be["false"];
        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
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
        account.balances['EUR'].deposit(amount1000);
        order = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
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
          this.account.balances['EUR'].deposit(amount1000);
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
        it('should adjust the locked funds and make deposits and withdrawals to apply the fill', function() {
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
          this.account.balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
          this.account.balances['EUR'].funds.compareTo(amount500).should.equal(0);
          return this.account.balances['BTC'].funds.compareTo(amount5).should.equal(0);
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
    describe('#cancel', function() {
      return it('should delete an order and unlock the appropriate funds', function() {
        var account, order;

        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(amount1000);
        order = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        });
        account.submit(order);
        account.cancel(order);
        expect(this.account.orders['1']).to.not.be.ok;
        return account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
      });
    });
    return describe('#export', function() {
      return it('should export the state of the account as a JSON stringifiable object that can be used to initialise a new Account in the exact same state', function() {
        var account, json, newAccount, order, orders, state;

        orders = Object.create(null);
        order = new Order({
          id: '1',
          timestamp: '1',
          account: '123456789',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        });
        orders[order.id] = order;
        account = new Account({
          id: '123456789',
          timestamp: '987654322',
          currencies: ['EUR', 'USD', 'BTC']
        });
        account.balances['EUR'].deposit(amount1000);
        account.submit(order);
        state = account["export"]();
        json = JSON.stringify(state);
        newAccount = new Account({
          state: JSON.parse(json),
          orders: orders
        });
        newAccount.equals(account).should.be["true"];
        return newAccount.orders[order.id].should.equal(order);
      });
    });
  });

}).call(this);
