(function() {
  var Account, Amount, Balance, Book, Checklist, CurrencyMarket, assert, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Checklist = require('checklist');

  CurrencyMarket = require('../src/CurrencyMarket');

  Book = require('../src/Book');

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  describe('CurrencyMarket', function() {
    beforeEach(function() {
      return this.currencyMarket = new CurrencyMarket({
        currencies: ['EUR', 'USD', 'BTC']
      });
    });
    it('should instantiate with a collection of accounts, orders and books matching the supported currencies', function() {
      Object.keys(this.currencyMarket.accounts).should.be.empty;
      Object.keys(this.currencyMarket.orders).should.be.empty;
      this.currencyMarket.books['EUR']['BTC'].should.be.an.instanceOf(Book);
      this.currencyMarket.books['EUR']['USD'].should.be.an.instanceOf(Book);
      this.currencyMarket.books['USD']['EUR'].should.be.an.instanceOf(Book);
      this.currencyMarket.books['BTC']['EUR'].should.be.an.instanceOf(Book);
      this.currencyMarket.books['USD']['EUR'].should.be.an.instanceOf(Book);
      return this.currencyMarket.books['EUR']['USD'].should.be.an.instanceOf(Book);
    });
    describe('#register', function() {
      it('should submit an account to the currencyMarket with the supported currencies and emit an account event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['Peter'], {
          ordered: true
        }, function(error) {
          _this.currencyMarket.removeAllListeners();
          return done(error);
        });
        this.currencyMarket.on('account', function(account) {
          return checklist.check(account.id);
        });
        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        account.should.be.an.instanceOf(Account);
        account.balances['EUR'].should.be.an.instanceOf(Balance);
        account.balances['USD'].should.be.an.instanceOf(Balance);
        return account.balances['BTC'].should.be.an.instanceOf(Balance);
      });
      return it('should throw an error if the account already exists', function() {
        var _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        return expect(function() {
          return _this.currencyMarket.register({
            id: 'Peter'
          });
        }).to["throw"]('Account already exists');
      });
    });
    describe('#deposit', function() {
      it('should credit the correct account and currency and emit a deposit event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['Peter', 'BTC', '50'], {
          ordered: true
        }, function(error) {
          _this.currencyMarket.removeAllListeners();
          return done(error);
        });
        this.currencyMarket.on('deposit', function(deposit) {
          checklist.check(deposit.account);
          checklist.check(deposit.currency);
          return checklist.check(deposit.amount);
        });
        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0);
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'BTC',
          amount: '50'
        });
        account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0);
        return account.balances['BTC'].funds.compareTo(new Amount('50')).should.equal(0);
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.currencyMarket.deposit({
            account: 'Peter',
            currency: 'BTC',
            amount: '50'
          });
        }).to["throw"]('Account does not exist');
      });
      return it('should throw an error if the currency is not supported', function() {
        var _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        return expect(function() {
          return _this.currencyMarket.deposit({
            account: 'Peter',
            currency: 'CAD',
            amount: '50'
          });
        }).to["throw"]('Currency is not supported');
      });
    });
    describe('#withdraw', function() {
      it('should debit the correct account and currency and emit a withdrawal event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['Peter', 'BTC', '50'], {
          ordered: true
        }, function(error) {
          _this.currencyMarket.removeAllListeners();
          return done(error);
        });
        this.currencyMarket.on('withdrawal', function(withdrawal) {
          checklist.check(withdrawal.account);
          checklist.check(withdrawal.currency);
          return checklist.check(withdrawal.amount);
        });
        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'BTC',
          amount: '200'
        });
        this.currencyMarket.withdraw({
          account: 'Peter',
          currency: 'BTC',
          amount: '50'
        });
        return account.balances['BTC'].funds.compareTo(new Amount('150')).should.equal(0);
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.currencyMarket.withdraw({
            account: 'Peter',
            currency: 'BTC',
            amount: '50'
          });
        }).to["throw"]('Account does not exist');
      });
      return it('should throw an error if the currency is not supported', function() {
        var _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        return expect(function() {
          return _this.currencyMarket.withdraw({
            account: 'Peter',
            currency: 'CAD',
            amount: '50'
          });
        }).to["throw"]('Currency is not supported');
      });
    });
    describe('#submit', function() {
      it('should lock the correct funds in the correct account', function() {
        var account;

        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '200'
        });
        this.currencyMarket.submit({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        this.currencyMarket.submit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '100'
        });
        return account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0);
      });
      it('should record an order, submit it to the correct book and emit an order event', function(done) {
        var checklist,
          _this = this;

        checklist = new Checklist(['123456789', '987654321', 'Peter', 'BTC', 'EUR', '100', '50'], {
          ordered: true
        }, function(error) {
          _this.currencyMarket.removeAllListeners();
          return done(error);
        });
        this.currencyMarket.on('order', function(order) {
          checklist.check(order.id);
          checklist.check(order.timestamp);
          checklist.check(order.account);
          checklist.check(order.bidCurrency);
          checklist.check(order.offerCurrency);
          checklist.check(order.offerPrice.toString());
          return checklist.check(order.offerAmount.toString());
        });
        this.currencyMarket.register({
          id: 'Peter'
        });
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '200'
        });
        this.currencyMarket.submit({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        this.currencyMarket.orders['123456789'].should.be.ok;
        return this.currencyMarket.books['BTC']['EUR'].highest.id.should.equal('123456789');
      });
      describe('while executing orders', function() {
        beforeEach(function() {
          this.currencyMarket.register({
            id: 'Peter'
          });
          this.currencyMarket.register({
            id: 'Paul'
          });
          this.currencyMarket.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '2000'
          });
          return this.currencyMarket.deposit({
            account: 'Paul',
            currency: 'BTC',
            amount: '400'
          });
        });
        describe('where the existing (right) order is an offer', function() {
          beforeEach(function() {
            return this.currencyMarket.submit({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: '0.2',
              offerAmount: '1000'
            });
          });
          describe('and the new (left) price is same', function() {
            describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount the left order is bidding', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.2',
                    bidAmount: '1000'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.2',
                    bidAmount: '500'
                  });
                  this.currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.2',
                    bidAmount: '1500'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal(0);
                });
              });
            });
            return describe('and the left order is an offer', function() {
              describe('and the right order is offering exactly the amount the left order is offering', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '5',
                    offerAmount: '200'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering', function() {
                return it('should trade the amount the left order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '5',
                    offerAmount: '100'
                  });
                  this.currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '5',
                    offerAmount: '300'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal(0);
                });
              });
            });
          });
          return describe('and the new (left) price is the better', function() {
            describe('and the left order is an offer', function() {
              describe('and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '200'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the left order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '100'
                  });
                  this.currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '300'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount that the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '1000'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '500'
                  });
                  this.currencyMarket.orders['1'].offerAmount.compareTo(new Amount('500')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '1500'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal(0);
                });
              });
            });
          });
        });
        return describe('where the existing (right) order is a bid', function() {
          beforeEach(function() {
            return this.currencyMarket.submit({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: '5',
              bidAmount: '200'
            });
          });
          return describe('and the new (left) price is better', function() {
            describe('and the left order is an offer', function() {
              describe('and the right order is bidding exactly the amount that the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '200'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is offering', function() {
                return it('should trade the amount the left order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '100'
                  });
                  this.currencyMarket.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: '4',
                    offerAmount: '300'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].offerAmount.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('100')).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '1000'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the left order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100.0', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '500'
                  });
                  this.currencyMarket.orders['1'].bidAmount.compareTo(new Amount('100')).should.equal(0);
                  expect(this.currencyMarket.orders['2']).to.not.be.ok;
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('100')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('300')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['EUR', '1000', '0.2', 'Paul', 'BTC', '200', '5', 'Peter'], {
                    ordered: true
                  }, function(error) {
                    _this.currencyMarket.removeAllListeners();
                    return done(error);
                  });
                  this.currencyMarket.on('trade', function(trade) {
                    checklist.check(trade.left.currency);
                    checklist.check(trade.left.amount);
                    checklist.check(trade.left.price);
                    checklist.check(trade.left.account);
                    checklist.check(trade.right.currency);
                    checklist.check(trade.right.amount);
                    checklist.check(trade.right.price);
                    return checklist.check(trade.right.account);
                  });
                  this.currencyMarket.submit({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: '0.25',
                    bidAmount: '1500'
                  });
                  expect(this.currencyMarket.orders['1']).to.not.be.ok;
                  this.currencyMarket.orders['2'].bidAmount.compareTo(new Amount('500')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1000')).should.equal(0);
                  this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('200')).should.equal(0);
                  return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal(0);
                });
              });
            });
          });
        });
      });
      describe('when multiple orders can be matched', function() {
        beforeEach(function() {
          this.currencyMarket.register({
            id: 'Peter'
          });
          this.currencyMarket.register({
            id: 'Paul'
          });
          this.currencyMarket.deposit({
            account: 'Peter',
            currency: 'EUR',
            amount: '2000'
          });
          this.currencyMarket.deposit({
            account: 'Paul',
            currency: 'BTC',
            amount: '1000'
          });
          this.currencyMarket.submit({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '0.2',
            offerAmount: '500'
          });
          this.currencyMarket.submit({
            id: '2',
            timestamp: '2',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '0.25',
            offerAmount: '500'
          });
          this.currencyMarket.submit({
            id: '3',
            timestamp: '3',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '0.5',
            offerAmount: '500'
          });
          return this.currencyMarket.submit({
            id: '4',
            timestamp: '4',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '1.0',
            offerAmount: '500'
          });
        });
        describe('and the last order can be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function(done) {
            var checklist,
              _this = this;

            checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100.0', '5', 'Peter', 'EUR', '500', '0.25', 'Paul', 'BTC', '125.00', '4', 'Peter', 'EUR', '250.0', '0.5', 'Paul', 'BTC', '125.00', '2', 'Peter'], {
              ordered: true
            }, function(error) {
              _this.currencyMarket.removeAllListeners();
              return done(error);
            });
            this.currencyMarket.on('trade', function(trade) {
              checklist.check(trade.left.currency);
              checklist.check(trade.left.amount);
              checklist.check(trade.left.price);
              checklist.check(trade.left.account);
              checklist.check(trade.right.currency);
              checklist.check(trade.right.amount);
              checklist.check(trade.right.price);
              return checklist.check(trade.right.account);
            });
            this.currencyMarket.submit({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: '0.5',
              bidAmount: '1250'
            });
            expect(this.currencyMarket.orders['1']).to.not.be.ok;
            expect(this.currencyMarket.orders['2']).to.not.be.ok;
            this.currencyMarket.orders['3'].offerAmount.compareTo(new Amount('250')).should.equal(0);
            this.currencyMarket.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal(0);
            expect(this.currencyMarket.orders['5']).to.not.be.ok;
            this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('750')).should.equal(0);
            this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('750')).should.equal(0);
            this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('350')).should.equal(0);
            this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1250')).should.equal(0);
            this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('650')).should.equal(0);
            return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          });
        });
        return describe('and the last order can not be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function(done) {
            var checklist,
              _this = this;

            checklist = new Checklist(['EUR', '500', '0.2', 'Paul', 'BTC', '100.0', '5', 'Peter', 'EUR', '500', '0.25', 'Paul', 'BTC', '125.00', '4', 'Peter', 'EUR', '500', '0.5', 'Paul', 'BTC', '250.0', '2', 'Peter'], {
              ordered: true
            }, function(error) {
              _this.currencyMarket.removeAllListeners();
              return done(error);
            });
            this.currencyMarket.on('trade', function(trade) {
              checklist.check(trade.left.currency);
              checklist.check(trade.left.amount);
              checklist.check(trade.left.price);
              checklist.check(trade.left.account);
              checklist.check(trade.right.currency);
              checklist.check(trade.right.amount);
              checklist.check(trade.right.price);
              return checklist.check(trade.right.account);
            });
            this.currencyMarket.submit({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: '0.5',
              bidAmount: '1750'
            });
            expect(this.currencyMarket.orders['1']).to.not.be.ok;
            expect(this.currencyMarket.orders['2']).to.not.be.ok;
            expect(this.currencyMarket.orders['3']).to.not.be.ok;
            this.currencyMarket.orders['4'].offerAmount.compareTo(new Amount('500')).should.equal(0);
            this.currencyMarket.orders['5'].bidAmount.compareTo(new Amount('250')).should.equal(0);
            this.currencyMarket.accounts['Peter'].balances['EUR'].funds.compareTo(new Amount('500')).should.equal(0);
            this.currencyMarket.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(new Amount('500')).should.equal(0);
            this.currencyMarket.accounts['Peter'].balances['BTC'].funds.compareTo(new Amount('475')).should.equal(0);
            this.currencyMarket.accounts['Paul'].balances['EUR'].funds.compareTo(new Amount('1500')).should.equal(0);
            this.currencyMarket.accounts['Paul'].balances['BTC'].funds.compareTo(new Amount('525')).should.equal(0);
            return this.currencyMarket.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(new Amount('125')).should.equal(0);
          });
        });
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.currencyMarket.submit({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '100',
            offerAmount: '50'
          });
        }).to["throw"]('Account does not exist');
      });
      it('should throw an error if the offer currency is not supported', function() {
        var _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        return expect(function() {
          return _this.currencyMarket.submit({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'CAD',
            offerPrice: '100',
            offerAmount: '50'
          });
        }).to["throw"]('Offer currency is not supported');
      });
      return it('should throw an error if the bid currency is not supported', function() {
        var _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        return expect(function() {
          return _this.currencyMarket.submit({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'CAD',
            offerCurrency: 'EUR',
            offerPrice: '100',
            offerAmount: '50'
          });
        }).to["throw"]('Bid currency is not supported');
      });
    });
    describe('#cancel', function() {
      it('should unlock the correct funds in the correct account', function() {
        var account;

        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '200'
        });
        this.currencyMarket.submit({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        this.currencyMarket.submit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '100'
        });
        account.balances['EUR'].lockedFunds.compareTo(new Amount('150')).should.equal(0);
        this.currencyMarket.cancel({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        return account.balances['EUR'].lockedFunds.compareTo(new Amount('100')).should.equal(0);
      });
      it('should remove the order from the orders collection and from the correct book and emit an cancellation event', function(done) {
        var checklist,
          _this = this;

        checklist = new Checklist(['123456789', '987654321', 'Peter', 'BTC', 'EUR', '100', '50'], {
          ordered: true
        }, function(error) {
          _this.currencyMarket.removeAllListeners();
          return done(error);
        });
        this.currencyMarket.on('cancellation', function(order) {
          checklist.check(order.id);
          checklist.check(order.timestamp);
          checklist.check(order.account);
          checklist.check(order.bidCurrency);
          checklist.check(order.offerCurrency);
          checklist.check(order.offerPrice.toString());
          return checklist.check(order.offerAmount.toString());
        });
        this.currencyMarket.register({
          id: 'Peter'
        });
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '200'
        });
        this.currencyMarket.submit({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        this.currencyMarket.cancel({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        expect(this.currencyMarket.orders['123456789']).to.not.be.ok;
        return expect(this.currencyMarket.books['BTC']['EUR'].highest).to.not.be.ok;
      });
      it('should throw an error if the order cannot be found', function() {
        var _this = this;

        return expect(function() {
          return _this.currencyMarket.cancel({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '100',
            offerAmount: '50'
          });
        }).to["throw"]('Order cannot be found');
      });
      return it('should throw an error if the order does not match', function() {
        var account,
          _this = this;

        this.currencyMarket.register({
          id: 'Peter'
        });
        account = this.currencyMarket.accounts['Peter'];
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '200'
        });
        this.currencyMarket.submit({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '100',
          offerAmount: '50'
        });
        return expect(function() {
          return _this.currencyMarket.cancel({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: '100',
            offerAmount: '20'
          });
        }).to["throw"]('Order does not match');
      });
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.currencyMarket1 = new CurrencyMarket({
          currencies: ['EUR', 'USD', 'BTC']
        });
        this.currencyMarket1.register({
          id: 'Peter'
        });
        this.currencyMarket1.register({
          id: 'Paul'
        });
        this.currencyMarket1.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        this.currencyMarket1.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        this.currencyMarket1.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        this.currencyMarket1.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        this.currencyMarket1.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        return this.currencyMarket1.submit({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '1.0',
          offerAmount: '500'
        });
      });
      it('should return true if 2 markets are equal', function() {
        var currencyMarket2;

        currencyMarket2 = new CurrencyMarket({
          currencies: ['EUR', 'USD', 'BTC']
        });
        currencyMarket2.register({
          id: 'Peter'
        });
        currencyMarket2.register({
          id: 'Paul'
        });
        currencyMarket2.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        currencyMarket2.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        currencyMarket2.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '1.0',
          offerAmount: '500'
        });
        return currencyMarket2.equals(this.currencyMarket1).should.be["true"];
      });
      it('should return false if the currencies list is different', function() {
        var currencyMarket2;

        currencyMarket2 = new CurrencyMarket({
          currencies: ['EUR', 'BTC']
        });
        currencyMarket2.register({
          id: 'Peter'
        });
        currencyMarket2.register({
          id: 'Paul'
        });
        currencyMarket2.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        currencyMarket2.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        currencyMarket2.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '1.0',
          offerAmount: '500'
        });
        return currencyMarket2.equals(this.currencyMarket1).should.be["false"];
      });
      it('should return false if the accounts are different', function() {
        var currencyMarket2;

        currencyMarket2 = new CurrencyMarket({
          currencies: ['EUR', 'USD', 'BTC']
        });
        currencyMarket2.register({
          id: 'Peter'
        });
        currencyMarket2.register({
          id: 'Paul'
        });
        currencyMarket2.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2500'
        });
        currencyMarket2.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        currencyMarket2.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '1.0',
          offerAmount: '500'
        });
        return currencyMarket2.equals(this.currencyMarket1).should.be["false"];
      });
      return it('should return false if the orders or books are different', function() {
        var currencyMarket2;

        currencyMarket2 = new CurrencyMarket({
          currencies: ['EUR', 'USD', 'BTC']
        });
        currencyMarket2.register({
          id: 'Peter'
        });
        currencyMarket2.register({
          id: 'Paul'
        });
        currencyMarket2.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        currencyMarket2.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        currencyMarket2.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        currencyMarket2.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        return currencyMarket2.equals(this.currencyMarket1).should.be["false"];
      });
    });
    return describe('#export', function() {
      return it('should export the state of the market as a JSON stringifiable object that can be used to initialise a new CurrencyMarket in the exact same state', function() {
        var json, newCurrencyMarket, state;

        this.currencyMarket.register({
          id: 'Peter'
        });
        this.currencyMarket.register({
          id: 'Paul'
        });
        this.currencyMarket.deposit({
          account: 'Peter',
          currency: 'EUR',
          amount: '2000'
        });
        this.currencyMarket.deposit({
          account: 'Paul',
          currency: 'BTC',
          amount: '1000'
        });
        this.currencyMarket.submit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.2',
          offerAmount: '500'
        });
        this.currencyMarket.submit({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.25',
          offerAmount: '500'
        });
        this.currencyMarket.submit({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '0.5',
          offerAmount: '500'
        });
        this.currencyMarket.submit({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: '1.0',
          offerAmount: '500'
        });
        state = this.currencyMarket["export"]();
        json = JSON.stringify(state);
        newCurrencyMarket = new CurrencyMarket({
          state: JSON.parse(json)
        });
        return newCurrencyMarket.equals(this.currencyMarket).should.be["true"];
      });
    });
  });

}).call(this);
