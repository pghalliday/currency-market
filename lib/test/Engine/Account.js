(function() {
  var Account, Amount, Balance, Order, amount10, amount100, amount1000, amount15, amount150, amount175, amount200, amount25, amount300, amount4, amount5, amount50, amount500, amountPoint01, assert, chai, expect, newBid, newOffer, sinon, sinonChai;

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
      it('should add an order to the orders collection and lock the appropriate funds', function() {
        var account, order;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'EUR',
          amount: '1000'
        });
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
        return account.getBalance('EUR').lockedFunds.compareTo(amount1000).should.equal(0);
      });
      describe('when a done event fires', function() {
        return it('should remove the order from the orders collection', function() {
          var account, bid, offer;

          account = new Account({
            id: '123456789'
          });
          account.deposit({
            currency: 'BTC',
            amount: '200'
          });
          offer = newOffer('1', 'BTC', amount50);
          account.submit(offer);
          bid = newBid('2', 'BTC', amount25);
          bid.match(offer);
          account.getBalance('BTC').lockedFunds.compareTo(amount25).should.equal(0);
          account.getBalance('BTC').funds.compareTo(amount175).should.equal(0);
          bid = newBid('3', 'BTC', amount50);
          bid.match(offer);
          account.getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          account.getBalance('BTC').funds.compareTo(amount150).should.equal(0);
          return expect(account.orders['1']).to.not.be.ok;
        });
      });
      return describe('when the order fill event fires', function() {
        beforeEach(function() {
          this.commissionAccount = new Account({
            id: 'commission'
          });
          this.calculateCommission = sinon.stub().returns(Amount.ONE);
          this.account = new Account({
            id: '123456789',
            commission: {
              account: this.commissionAccount,
              calculate: this.calculateCommission
            }
          });
          this.account.deposit({
            currency: 'EUR',
            amount: '1000'
          });
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
        it('should adjust the locked funds, apply commission and make deposits and withdrawals to apply the fill', function() {
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
          this.calculateCommission.should.have.been.calledOnce;
          this.calculateCommission.firstCall.args[0].amount.compareTo(amount5).should.equal(0);
          this.calculateCommission.firstCall.args[0].timestamp.should.equal(order.timestamp);
          this.calculateCommission.firstCall.args[0].account.should.equal(this.order.account);
          this.calculateCommission.firstCall.args[0].currency.should.equal(this.order.bidCurrency);
          this.commissionAccount.getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
          this.account.orders['1'].should.equal(this.order);
          this.account.getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
          this.account.getBalance('EUR').funds.compareTo(amount500).should.equal(0);
          return this.account.getBalance('BTC').funds.compareTo(amount4).should.equal(0);
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
          return this.account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
        });
      });
    });
    describe('#cancel', function() {
      return it('should delete an order and unlock the appropriate funds', function() {
        var account, order;

        account = new Account({
          id: '123456789'
        });
        account.deposit({
          currency: 'EUR',
          amount: '1000'
        });
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
        return account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
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
            amount: '50'
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
          amount: '50'
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
            amount: '50'
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
          amount: '200'
        });
        account.submit(newOffer('1', 'BTC', amount50));
        account.submit(newOffer('2', 'BTC', amount100));
        account.withdraw({
          currency: 'BTC',
          amount: '25'
        });
        account.getBalance('BTC').funds.compareTo(amount175).should.equal(0);
        account.withdraw({
          currency: 'BTC',
          amount: '25'
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
          amount: '200'
        });
        account.submit(newOffer('1', 'BTC', amount50));
        account.submit(newOffer('2', 'BTC', amount100));
        return expect(function() {
          return account.withdraw({
            currency: 'BTC',
            amount: '100'
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
          amount: '200'
        });
        account.submit(newOffer('1', 'BTC', amount50));
        account.submit(newOffer('2', 'BTC', amount100));
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
