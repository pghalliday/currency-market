(function() {
  var Account, Amount, Balance, Book, Checklist, Market, Order, amount1, amount100, amount1000, amount125, amount1250, amount150, amount1500, amount1750, amount20, amount200, amount2000, amount250, amount2500, amount300, amount350, amount4, amount400, amount475, amount4950, amount5, amount50, amount500, amount525, amount650, amount750, amount99, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, newAccount;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Checklist = require('checklist');

  Market = require('../src/Market');

  Book = require('../src/Book');

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amountPoint5 = new Amount('0.5');

  amount1 = new Amount('1');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount20 = new Amount('20');

  amount50 = new Amount('50');

  amount99 = new Amount('99');

  amount100 = new Amount('100');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount200 = new Amount('200');

  amount250 = new Amount('250');

  amount300 = new Amount('300');

  amount350 = new Amount('350');

  amount400 = new Amount('400');

  amount475 = new Amount('475');

  amount500 = new Amount('500');

  amount525 = new Amount('525');

  amount650 = new Amount('650');

  amount750 = new Amount('750');

  amount1000 = new Amount('1000');

  amount1250 = new Amount('1250');

  amount1500 = new Amount('1500');

  amount1750 = new Amount('1750');

  amount2000 = new Amount('2000');

  amount2500 = new Amount('2500');

  amount4950 = new Amount('4950');

  newAccount = function(id) {
    return new Account({
      id: id,
      timestamp: '987654321',
      currencies: ['EUR', 'USD', 'BTC']
    });
  };

  describe('Market', function() {
    beforeEach(function() {
      return this.market = new Market({
        currencies: ['EUR', 'USD', 'BTC']
      });
    });
    it('should instantiate with a collection of accounts and books matching the supported currencies', function() {
      Object.keys(this.market.accounts).should.be.empty;
      this.market.books['EUR']['BTC'].should.be.an.instanceOf(Book);
      this.market.books['EUR']['USD'].should.be.an.instanceOf(Book);
      this.market.books['USD']['EUR'].should.be.an.instanceOf(Book);
      this.market.books['BTC']['EUR'].should.be.an.instanceOf(Book);
      this.market.books['USD']['EUR'].should.be.an.instanceOf(Book);
      return this.market.books['EUR']['USD'].should.be.an.instanceOf(Book);
    });
    describe('#register', function() {
      it('should submit an account to the market, record the last transaction ID and emit an account event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['123456789', '987654321'], {
          ordered: true
        }, function(error) {
          _this.market.removeAllListeners();
          return done(error);
        });
        this.market.on('account', function(account) {
          checklist.check(account.id);
          return checklist.check(account.timestamp);
        });
        account = newAccount('123456789');
        this.market.register(account);
        this.market.lastTransaction.should.equal('123456789');
        account = this.market.accounts['123456789'];
        return account.should.equal(account);
      });
      return it('should throw an error if the account already exists', function() {
        var _this = this;

        this.market.register(newAccount('123456789'));
        return expect(function() {
          return _this.market.register(newAccount('123456789'));
        }).to["throw"]('Account already exists');
      });
    });
    describe('#deposit', function() {
      it('should throw an error if no transaction ID is given', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.deposit({
            timestamp: '987654322',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Must supply transaction ID');
      });
      it('should throw an error if no timestamp is given', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.deposit({
            id: '123456790',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Must supply timestamp');
      });
      it('should credit the correct account and currency, record the last transaction ID and emit a deposit event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['123456790', '987654322', 'Peter', 'BTC', '50'], {
          ordered: true
        }, function(error) {
          _this.market.removeAllListeners();
          return done(error);
        });
        this.market.on('deposit', function(deposit) {
          checklist.check(deposit.id);
          checklist.check(deposit.timestamp);
          checklist.check(deposit.account);
          checklist.check(deposit.currency);
          return checklist.check(deposit.amount.toString());
        });
        this.market.register(newAccount('Peter'));
        account = this.market.accounts['Peter'];
        account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['BTC'].funds.compareTo(Amount.ZERO).should.equal(0);
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
        });
        this.market.lastTransaction.should.equal('123456790');
        account.balances['EUR'].funds.compareTo(Amount.ZERO).should.equal(0);
        account.balances['USD'].funds.compareTo(Amount.ZERO).should.equal(0);
        return account.balances['BTC'].funds.compareTo(amount50).should.equal(0);
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Account does not exist');
      });
      return it('should throw an error if the currency is not supported', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'CAD',
            amount: amount50
          });
        }).to["throw"]('Currency is not supported');
      });
    });
    describe('#withdraw', function() {
      it('should throw an error if no transaction ID is given', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount200
        });
        return expect(function() {
          return _this.market.withdraw({
            timestamp: '987654322',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Must supply transaction ID');
      });
      it('should throw an error if no timestamp is given', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount200
        });
        return expect(function() {
          return _this.market.withdraw({
            id: '123456790',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Must supply timestamp');
      });
      it('should debit the correct account and currency, record the last transaction ID and emit a withdrawal event', function(done) {
        var account, checklist,
          _this = this;

        checklist = new Checklist(['123456791', '987654323', 'Peter', 'BTC', '50'], {
          ordered: true
        }, function(error) {
          _this.market.removeAllListeners();
          return done(error);
        });
        this.market.on('withdrawal', function(withdrawal) {
          checklist.check(withdrawal.id);
          checklist.check(withdrawal.timestamp);
          checklist.check(withdrawal.account);
          checklist.check(withdrawal.currency);
          return checklist.check(withdrawal.amount.toString());
        });
        this.market.register(newAccount('Peter'));
        account = this.market.accounts['Peter'];
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount200
        });
        this.market.withdraw({
          id: '123456791',
          timestamp: '987654323',
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
        });
        this.market.lastTransaction.should.equal('123456791');
        return account.balances['BTC'].funds.compareTo(amount150).should.equal(0);
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.market.withdraw({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Account does not exist');
      });
      return it('should throw an error if the currency is not supported', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.withdraw({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'CAD',
            amount: amount50
          });
        }).to["throw"]('Currency is not supported');
      });
    });
    describe('#submit', function() {
      it('should lock the correct funds in the correct account', function() {
        var account;

        this.market.register(newAccount('Peter'));
        account = this.market.accounts['Peter'];
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount200
        });
        this.market.submit(new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        this.market.submit(new Order({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount100
        }));
        return account.balances['EUR'].lockedFunds.compareTo(amount150).should.equal(0);
      });
      it('should record an order, submit it to the correct book, record the last transaction ID and emit an order event', function(done) {
        var checklist,
          _this = this;

        checklist = new Checklist(['123456793', '987654321', 'Peter', 'BTC', 'EUR', '100', '50', '0.01', '5000', '123456794', '987654322', 'Paul', 'EUR', 'BTC', '0.010101010101010101010101', '4950', '99', '50'], {
          ordered: true
        }, function(error) {
          _this.market.removeAllListeners();
          return done(error);
        });
        this.market.on('order', function(order) {
          checklist.check(order.id);
          checklist.check(order.timestamp);
          checklist.check(order.account);
          checklist.check(order.bidCurrency);
          checklist.check(order.offerCurrency);
          checklist.check(order.offerPrice.toString());
          checklist.check(order.offerAmount.toString());
          checklist.check(order.bidPrice.toString());
          return checklist.check(order.bidAmount.toString());
        });
        this.market.register(newAccount('Peter'));
        this.market.register(newAccount('Paul'));
        this.market.deposit({
          id: '123456791',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount200
        });
        this.market.deposit({
          id: '123456792',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount4950
        });
        this.market.submit(new Order({
          id: '123456793',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        this.market.lastTransaction.should.equal('123456793');
        this.market.books['BTC']['EUR'].highest.id.should.equal('123456793');
        this.market.submit(new Order({
          id: '123456794',
          timestamp: '987654322',
          account: 'Paul',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: amount99,
          bidAmount: amount50
        }));
        this.market.lastTransaction.should.equal('123456794');
        return this.market.books['EUR']['BTC'].highest.id.should.equal('123456794');
      });
      describe('while executing orders', function() {
        beforeEach(function() {
          this.market.register(newAccount('Peter'));
          this.market.register(newAccount('Paul'));
          this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'EUR',
            amount: amount2000
          });
          return this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Paul',
            currency: 'BTC',
            amount: amount400
          });
        });
        describe('where the existing (right) order is an offer', function() {
          beforeEach(function() {
            return this.market.submit(new Order({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amountPoint2,
              offerAmount: amount1000
            }));
          });
          describe('and the new (left) price is same', function() {
            describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount the left order is bidding', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount1000
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount500
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount1500
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is an offer', function() {
              describe('and the right order is offering exactly the amount the left order is offering', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount200
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering', function() {
                return it('should trade the amount the left order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount100
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering', function() {
                return it('should trade the amount the right order is offering and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount300
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal(0);
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

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount200
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the left order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount100
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount300
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount that the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1000
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount500
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1500
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal(0);
                });
              });
            });
          });
        });
        return describe('where the existing (right) order is a bid', function() {
          beforeEach(function() {
            return this.market.submit(new Order({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: amount5,
              bidAmount: amount200
            }));
          });
          return describe('and the new (left) price is better', function() {
            describe('and the left order is an offer', function() {
              describe('and the right order is bidding exactly the amount that the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount200
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is offering', function() {
                return it('should trade the amount the left order is offering at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount100
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount300
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.offerAmount.compareTo(amount100).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1000
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the left order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '500', '0.2', '1', '100.0', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount500
                  }));
                  this.market.books['BTC']['EUR'].entries['1'].order.bidAmount.compareTo(amount100).should.equal(0);
                  expect(this.market.books['EUR']['BTC'].entries['2']).to.not.be.ok;
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount100).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount300).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price and emit a trade event', function(done) {
                  var checklist,
                    _this = this;

                  checklist = new Checklist(['2', '1000', '0.2', '1', '200', '5'], {
                    ordered: true
                  }, function(error) {
                    _this.market.removeAllListeners();
                    return done(error);
                  });
                  this.market.on('trade', function(trade) {
                    checklist.check(trade.left.order.id);
                    checklist.check(trade.left.amount.toString());
                    checklist.check(trade.left.price.toString());
                    checklist.check(trade.right.order.id);
                    checklist.check(trade.right.amount.toString());
                    return checklist.check(trade.right.price.toString());
                  });
                  this.market.submit(new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1500
                  }));
                  expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
                  this.market.books['EUR']['BTC'].entries['2'].order.bidAmount.compareTo(amount500).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1000).should.equal(0);
                  this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount200).should.equal(0);
                  return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal(0);
                });
              });
            });
          });
        });
      });
      describe('when multiple orders can be matched', function() {
        beforeEach(function() {
          this.market.register(newAccount('Peter'));
          this.market.register(newAccount('Paul'));
          this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            currency: 'EUR',
            amount: amount2000
          });
          this.market.deposit({
            id: '123456790',
            timestamp: '987654322',
            account: 'Paul',
            currency: 'BTC',
            amount: amount1000
          });
          this.market.submit(new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint2,
            offerAmount: amount500
          }));
          this.market.submit(new Order({
            id: '2',
            timestamp: '2',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint25,
            offerAmount: amount500
          }));
          this.market.submit(new Order({
            id: '3',
            timestamp: '3',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint5,
            offerAmount: amount500
          }));
          return this.market.submit(new Order({
            id: '4',
            timestamp: '4',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount1,
            offerAmount: amount500
          }));
        });
        describe('and the last order can be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function(done) {
            var checklist,
              _this = this;

            checklist = new Checklist(['5', '500', '0.2', '1', '100.0', '5', '5', '500', '0.25', '2', '125.00', '4', '5', '250.0', '0.5', '3', '125.00', '2'], {
              ordered: true
            }, function(error) {
              _this.market.removeAllListeners();
              return done(error);
            });
            this.market.on('trade', function(trade) {
              checklist.check(trade.left.order.id);
              checklist.check(trade.left.amount.toString());
              checklist.check(trade.left.price.toString());
              checklist.check(trade.right.order.id);
              checklist.check(trade.right.amount.toString());
              return checklist.check(trade.right.price.toString());
            });
            this.market.submit(new Order({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amountPoint5,
              bidAmount: amount1250
            }));
            expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
            expect(this.market.books['BTC']['EUR'].entries['2']).to.not.be.ok;
            this.market.books['BTC']['EUR'].entries['3'].order.offerAmount.compareTo(amount250).should.equal(0);
            this.market.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal(0);
            expect(this.market.books['EUR']['BTC'].entries[amount5]).to.not.be.ok;
            this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount750).should.equal(0);
            this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount750).should.equal(0);
            this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount350).should.equal(0);
            this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1250).should.equal(0);
            this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount650).should.equal(0);
            return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          });
        });
        return describe('and the last order cannot be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function(done) {
            var checklist,
              _this = this;

            checklist = new Checklist(['5', '500', '0.2', '1', '100.0', '5', '5', '500', '0.25', '2', '125.00', '4', '5', '500', '0.5', '3', '250.0', '2'], {
              ordered: true
            }, function(error) {
              _this.market.removeAllListeners();
              return done(error);
            });
            this.market.on('trade', function(trade) {
              checklist.check(trade.left.order.id);
              checklist.check(trade.left.amount.toString());
              checklist.check(trade.left.price.toString());
              checklist.check(trade.right.order.id);
              checklist.check(trade.right.amount.toString());
              return checklist.check(trade.right.price.toString());
            });
            this.market.submit(new Order({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amountPoint5,
              bidAmount: amount1750
            }));
            expect(this.market.books['BTC']['EUR'].entries['1']).to.not.be.ok;
            expect(this.market.books['BTC']['EUR'].entries['2']).to.not.be.ok;
            expect(this.market.books['BTC']['EUR'].entries['3']).to.not.be.ok;
            this.market.books['BTC']['EUR'].entries[amount4].order.offerAmount.compareTo(amount500).should.equal(0);
            this.market.books['EUR']['BTC'].entries[amount5].order.bidAmount.compareTo(amount250).should.equal(0);
            this.market.accounts['Peter'].balances['EUR'].funds.compareTo(amount500).should.equal(0);
            this.market.accounts['Peter'].balances['EUR'].lockedFunds.compareTo(amount500).should.equal(0);
            this.market.accounts['Peter'].balances['BTC'].funds.compareTo(amount475).should.equal(0);
            this.market.accounts['Paul'].balances['EUR'].funds.compareTo(amount1500).should.equal(0);
            this.market.accounts['Paul'].balances['BTC'].funds.compareTo(amount525).should.equal(0);
            return this.market.accounts['Paul'].balances['BTC'].lockedFunds.compareTo(amount125).should.equal(0);
          });
        });
      });
      it('should throw an error if the account does not exist', function() {
        var _this = this;

        return expect(function() {
          return _this.market.submit(new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          }));
        }).to["throw"]('Account does not exist');
      });
      it('should throw an error if the offer currency is not supported', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.submit(new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'CAD',
            offerPrice: amount100,
            offerAmount: amount50
          }));
        }).to["throw"]('Offer currency is not supported');
      });
      return it('should throw an error if the bid currency is not supported', function() {
        var _this = this;

        this.market.register(newAccount('Peter'));
        return expect(function() {
          return _this.market.submit(new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'CAD',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          }));
        }).to["throw"]('Bid currency is not supported');
      });
    });
    describe('#cancel', function() {
      it('should unlock the correct funds in the correct account', function() {
        var account;

        this.market.register(newAccount('Peter'));
        account = this.market.accounts['Peter'];
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount200
        });
        this.market.submit(new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        this.market.submit(new Order({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          bidCurrency: 'USD',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount100
        }));
        account.balances['EUR'].lockedFunds.compareTo(amount150).should.equal(0);
        this.market.cancel({
          id: '123456791',
          timestamp: '987654350',
          order: new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          })
        });
        return account.balances['EUR'].lockedFunds.compareTo(amount100).should.equal(0);
      });
      it('should remove the order from the orders collection and from the correct book, record the last transaction ID and emit an cancellation event', function(done) {
        var checklist,
          _this = this;

        checklist = new Checklist(['123456795', '987654349', '123456793', '987654321', 'Peter', 'BTC', 'EUR', '100', '50', '0.01', '5000', '123456796', '987654350', '123456794', '987654322', 'Paul', 'EUR', 'BTC', '0.010101010101010101010101', '4950', '99', '50'], {
          ordered: true
        }, function(error) {
          _this.market.removeAllListeners();
          return done(error);
        });
        this.market.on('cancellation', function(cancellation) {
          checklist.check(cancellation.id);
          checklist.check(cancellation.timestamp);
          checklist.check(cancellation.order.id);
          checklist.check(cancellation.order.timestamp);
          checklist.check(cancellation.order.account);
          checklist.check(cancellation.order.bidCurrency);
          checklist.check(cancellation.order.offerCurrency);
          checklist.check(cancellation.order.offerPrice.toString());
          checklist.check(cancellation.order.offerAmount.toString());
          checklist.check(cancellation.order.bidPrice.toString());
          return checklist.check(cancellation.order.bidAmount.toString());
        });
        this.market.register(newAccount('Peter'));
        this.market.register(newAccount('Paul'));
        this.market.deposit({
          id: '123456791',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount200
        });
        this.market.deposit({
          id: '123456792',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount4950
        });
        this.market.submit(new Order({
          id: '123456793',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        this.market.submit(new Order({
          id: '123456794',
          timestamp: '987654322',
          account: 'Paul',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: amount99,
          bidAmount: amount50
        }));
        this.market.cancel({
          id: '123456795',
          timestamp: '987654349',
          order: new Order({
            id: '123456793',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          })
        });
        this.market.lastTransaction.should.equal('123456795');
        expect(this.market.books['BTC']['EUR'].entries['123456793']).to.not.be.ok;
        expect(this.market.books['BTC']['EUR'].highest).to.not.be.ok;
        this.market.cancel({
          id: '123456796',
          timestamp: '987654350',
          order: new Order({
            id: '123456794',
            timestamp: '987654322',
            account: 'Paul',
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            bidPrice: amount99,
            bidAmount: amount50
          })
        });
        this.market.lastTransaction.should.equal('123456796');
        expect(this.market.books['BTC']['EUR'].entries['123456794']).to.not.be.ok;
        return expect(this.market.books['EUR']['BTC'].highest).to.not.be.ok;
      });
      it('should throw an error if the order cannot be found', function() {
        var _this = this;

        return expect(function() {
          return _this.market.cancel({
            id: '123456795',
            timestamp: '987654349',
            order: new Order({
              id: '123456793',
              timestamp: '987654321',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            })
          });
        }).to["throw"]('Order cannot be found');
      });
      return it('should throw an error if the order does not match', function() {
        var account,
          _this = this;

        this.market.register(newAccount('Peter'));
        account = this.market.accounts['Peter'];
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount200
        });
        this.market.submit(new Order({
          id: '123456789',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        return expect(function() {
          return _this.market.cancel({
            id: '123456795',
            timestamp: '987654349',
            order: new Order({
              id: '123456789',
              timestamp: '987654321',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount20
            })
          });
        }).to["throw"]('Order does not match');
      });
    });
    describe('#equals', function() {
      beforeEach(function() {
        this.market1 = new Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        this.market1.register(newAccount('Peter'));
        this.market1.register(newAccount('Paul'));
        this.market1.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        this.market1.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        this.market1.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        this.market1.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        this.market1.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        return this.market1.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
      });
      it('should return true if 2 markets are equal', function() {
        var market2;

        market2 = new Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        market2.register(newAccount('Peter'));
        market2.register(newAccount('Paul'));
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        market2.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
        return market2.equals(this.market1).should.be["true"];
      });
      it('should return false if the last transaction is different', function() {
        var market2;

        market2 = new Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        market2.register(newAccount('Peter'));
        market2.register(newAccount('Paul'));
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        market2.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
        market2.lastTransaction = amount5;
        market2.equals(this.market1).should.be["false"];
        delete market2.lastTransaction;
        return market2.equals(this.market1).should.be["false"];
      });
      it('should return false if the currencies list is different', function() {
        var market2;

        market2 = new Market({
          currencies: ['EUR', 'BTC']
        });
        market2.register(newAccount('Peter'));
        market2.register(newAccount('Paul'));
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        market2.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
        return market2.equals(this.market1).should.be["false"];
      });
      it('should return false if the accounts are different', function() {
        var market2;

        market2 = new Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        market2.register(newAccount('Peter'));
        market2.register(newAccount('Paul'));
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2500
        });
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        market2.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
        return market2.equals(this.market1).should.be["false"];
      });
      return it('should return false if the orders or books are different', function() {
        var market2;

        market2 = new Market({
          currencies: ['EUR', 'USD', 'BTC']
        });
        market2.register(newAccount('Peter'));
        market2.register(newAccount('Paul'));
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        market2.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        market2.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        market2.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        return market2.equals(this.market1).should.be["false"];
      });
    });
    return describe('#export', function() {
      return it('should export the state of the market as a JSON stringifiable object that can be used to initialise a new Market in the exact same state', function() {
        var json, newMarket, state;

        this.market.register(newAccount('Peter'));
        this.market.register(newAccount('Paul'));
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'EUR',
          amount: amount2000
        });
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Paul',
          currency: 'BTC',
          amount: amount1000
        });
        this.market.submit(new Order({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint2,
          offerAmount: amount500
        }));
        this.market.submit(new Order({
          id: '2',
          timestamp: '2',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint25,
          offerAmount: amount500
        }));
        this.market.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amountPoint5,
          offerAmount: amount500
        }));
        this.market.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount1,
          offerAmount: amount500
        }));
        state = this.market["export"]();
        json = JSON.stringify(state);
        newMarket = new Market({
          state: JSON.parse(json)
        });
        return newMarket.equals(this.market).should.be["true"];
      });
    });
  });

}).call(this);