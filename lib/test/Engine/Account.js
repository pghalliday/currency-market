(function() {
  var Account, Amount, Balance, Order, amount10, amount100, amount1000, amount11250, amount15, amount150, amount175, amount200, amount25, amount2500, amount300, amount3750, amount4, amount5, amount50, amount500, amount6250, amount8750, amountPoint01, assert, chai, expect, newBid, newOffer, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Account = require('../../src/Engine/Account');

  Balance = require('../../src/Engine/Balance');

  Amount = require('../../src/Amount');

  Order = require('../../src/Engine/Order');

  amountPoint01 = new Amount('0.01');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount10 = new Amount('10');

  amount15 = new Amount('15');

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount100 = new Amount('100');

  amount150 = new Amount('150');

  amount175 = new Amount('175');

  amount200 = new Amount('200');

  amount300 = new Amount('300');

  amount500 = new Amount('500');

  amount1000 = new Amount('1000');

  amount2500 = new Amount('2500');

  amount3750 = new Amount('3750');

  amount6250 = new Amount('6250');

  amount8750 = new Amount('8750');

  amount11250 = new Amount('11250');

  newOffer = function(sequence, amount) {
    var params;

    return params = {
      sequence: sequence,
      timestamp: 1371737390976,
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerAmount: amount,
      offerPrice: amount100
    };
  };

  newBid = function(sequence, amount) {
    var params;

    return params = {
      sequence: sequence,
      timestamp: 1371737390976,
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidAmount: amount,
      bidPrice: amount150
    };
  };

  describe('Account', function() {
    it('should instantiate and record the account ID', function() {
      var account;

      account = new Account({
        id: '1'
      });
      return account.id.should.equal('1');
    });
    it('should throw an error if no ID is given', function() {
      return expect(function() {
        var account;

        return account = new Account();
      }).to["throw"]('Account ID must be specified');
    });
    describe('#submit', function() {
      it('should create a new order add it to the orders collection and lock the appropriate funds', function() {
        var account, order;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'EUR',
          amount: amount1000
        });
        order = account.submit({
          sequence: 0,
          timestamp: 1371737390976,
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        });
        order.sequence.should.equal(0);
        order.timestamp.should.equal(1371737390976);
        order.account.should.equal(account);
        order.offerBalance.should.equal(account.getBalance('EUR'));
        order.bidBalance.should.equal(account.getBalance('BTC'));
        order.bidPrice.compareTo(amount100).should.equal(0);
        order.bidAmount.compareTo(amount10).should.equal(0);
        account.orders[0].should.equal(order);
        return account.getBalance('EUR').lockedFunds.compareTo(amount1000).should.equal(0);
      });
      return describe('when a done event fires', function() {
        return it('should remove the order from the orders collection', function() {
          var accountPaul, accountPeter, bid, offer;

          accountPeter = new Account({
            id: 'Peter'
          });
          accountPaul = new Account({
            id: 'Paul'
          });
          accountPeter.deposit({
            currency: 'BTC',
            amount: amount200
          });
          accountPaul.deposit({
            currency: 'EUR',
            amount: amount11250
          });
          offer = accountPeter.submit(newOffer(1, amount50));
          accountPeter.orders[1].should.equal(offer);
          bid = accountPaul.submit(newBid(2, amount25));
          accountPaul.orders[2].should.equal(bid);
          bid.match(offer);
          expect(accountPaul.orders[2]).to.not.be.ok;
          accountPeter.orders[1].should.equal(offer);
          bid = accountPaul.submit(newBid(3, amount50));
          accountPaul.orders[3].should.equal(bid);
          bid.match(offer);
          accountPaul.orders[3].should.be.ok;
          return expect(accountPeter.orders[1]).to.not.be.ok;
        });
      });
    });
    describe('#cancel', function() {
      it('should error if the order cannot be found', function() {
        var account;

        account = new Account({
          id: 'Peter'
        });
        return expect(function() {
          return account.cancel(0);
        }).to["throw"]('Order cannot be found');
      });
      return it('should delete the order from the orders collection, unlock the appropriate funds and return the order', function() {
        var account, cancelled, order;

        account = new Account({
          id: 'Peter'
        });
        account.deposit({
          currency: 'EUR',
          amount: amount1000
        });
        order = account.submit({
          sequence: 0,
          timestamp: 1371737390976,
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        });
        cancelled = account.cancel(0);
        expect(account.orders[0]).to.not.be.ok;
        account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
        return cancelled.should.equal(order);
      });
    });
    describe('#getBalance', function() {
      return it('should return a balance object associated with the given currency', function() {
        var account, balance1, balance2, balance3;

        account = new Account({
          id: '123456789'
        });
        balance1 = account.getBalance('EUR');
        balance1.should.be.an.instanceOf(Balance);
        balance2 = account.getBalance('EUR');
        balance1.should.equal(balance2);
        balance3 = account.getBalance('USD');
        return balance3.should.not.equal(balance1);
      });
    });
    describe('#deposit', function() {
      it('should throw an error if no currency is supplied', function() {
        var account,
          _this = this;

        account = new Account({
          id: '123456789'
        });
        return expect(function() {
          return account.deposit({
            amount: amount50
          });
        }).to["throw"]('Must supply a currency');
      });
      it('should throw an error if no amount is supplied', function() {
        var account,
          _this = this;

        account = new Account({
          id: '123456789'
        });
        return expect(function() {
          return account.deposit({
            currency: 'BTC'
          });
        }).to["throw"]('Must supply an amount');
      });
      return it('should add the deposited amount to the funds for the correct currency', function() {
        var account;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'BTC',
          amount: amount50
        });
        return account.getBalance('BTC').funds.compareTo(amount50).should.equal(0);
      });
    });
    describe('#withdraw', function() {
      it('should throw an error if no currency is supplied', function() {
        var account,
          _this = this;

        account = new Account({
          id: '123456789'
        });
        return expect(function() {
          return account.withdraw({
            amount: amount50
          });
        }).to["throw"]('Must supply a currency');
      });
      it('should throw an error if no amount is supplied', function() {
        var account,
          _this = this;

        account = new Account({
          id: '123456789'
        });
        return expect(function() {
          return account.withdraw({
            currency: 'BTC'
          });
        }).to["throw"]('Must supply an amount');
      });
      it('should subtract the withdrawn amount from the funds of the correct currency', function() {
        var account;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'BTC',
          amount: amount200
        });
        account.submit(newOffer(1, amount50));
        account.submit(newOffer(2, amount100));
        account.withdraw({
          currency: 'BTC',
          amount: amount25
        });
        account.getBalance('BTC').funds.compareTo(amount175).should.equal(0);
        account.withdraw({
          currency: 'BTC',
          amount: amount25
        });
        return account.getBalance('BTC').funds.compareTo(amount150).should.equal(0);
      });
      return it('should throw an error if the withdrawal amount is greater than the funds available', function() {
        var account;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'BTC',
          amount: amount200
        });
        account.submit(newOffer(1, amount50));
        account.submit(newOffer(2, amount100));
        return expect(function() {
          return account.withdraw({
            currency: 'BTC',
            amount: amount200
          });
        }).to["throw"]('Cannot withdraw funds that are not available');
      });
    });
    return describe('#export', function() {
      return it('should return a JSON stringifiable object containing a snapshot of the account', function() {
        var account, balance, currency, json, object, _ref, _results;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'BTC',
          amount: amount200
        });
        account.submit(newOffer(1, amount50));
        account.submit(newOffer(2, amount100));
        json = JSON.stringify(account["export"]());
        object = JSON.parse(json);
        object.id.should.equal(account.id);
        _ref = object.balances;
        for (currency in _ref) {
          balance = _ref[currency];
          balance.should.deep.equal(account.getBalance(currency)["export"]());
        }
        _results = [];
        for (currency in account.balances) {
          _results.push(object.balances[currency].should.be.ok);
        }
        return _results;
      });
    });
  });

}).call(this);
