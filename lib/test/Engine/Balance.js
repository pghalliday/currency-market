(function() {
  var Account, Amount, Balance, Order, amount100, amount125, amount150, amount175, amount200, amount220, amount225, amount25, amount350, amount5, amount50, amount75, assert, chai, expect, newBid, newOffer, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Balance = require('../../src/Engine/Balance');

  Amount = require('../../src/Amount');

  Order = require('../../src/Engine/Order');

  Account = require('../../src/Engine/Account');

  amount5 = new Amount('5');

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount75 = new Amount('75');

  amount100 = new Amount('100');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount175 = new Amount('175');

  amount200 = new Amount('200');

  amount220 = new Amount('220');

  amount225 = new Amount('225');

  amount350 = new Amount('350');

  newOffer = function(id, amount) {
    return new Order({
      id: id,
      timestamp: id,
      account: 'name',
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerAmount: amount,
      offerPrice: amount100
    });
  };

  newBid = function(id, amount) {
    return new Order({
      id: id,
      timestamp: id,
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidAmount: amount,
      bidPrice: amount150
    });
  };

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
        balance.deposit('200');
        balance.funds.compareTo(amount200).should.equal(0);
        balance.deposit('150');
        return balance.funds.compareTo(amount350).should.equal(0);
      });
    });
    describe('#submitOffer', function() {
      it('should lock the offer amount', function() {
        var balance;

        balance = new Balance();
        balance.deposit('200');
        balance.submitOffer(newOffer('1', amount50));
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        balance.submitOffer(newOffer('2', amount100));
        return balance.lockedFunds.compareTo(amount150).should.equal(0);
      });
      it('should throw an error if there are not enough funds available to satisfy the order', function() {
        var balance;

        balance = new Balance();
        balance.deposit('200');
        balance.submitOffer(newOffer('1', amount100));
        return expect(function() {
          return balance.submitOffer(newOffer('2', amount150));
        }).to["throw"]('Cannot lock funds that are not available');
      });
      return describe('when a fill event fires', function() {
        return it('should unlock funds and withdraw the correct amount', function() {
          var balance, bid, offer;

          balance = new Balance();
          balance.deposit('200');
          offer = newOffer('1', amount50);
          balance.submitOffer(offer);
          bid = newBid('2', amount25);
          bid.match(offer);
          balance.lockedFunds.compareTo(amount25).should.equal(0);
          balance.funds.compareTo(amount175).should.equal(0);
          bid = newBid('3', amount50);
          bid.match(offer);
          balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          return balance.funds.compareTo(amount150).should.equal(0);
        });
      });
    });
    describe('#submitBid', function() {
      it('should wait for a fill event and deposit the correct amount of funds', function() {
        var balance, bid, offer;

        balance = new Balance();
        balance.deposit('200');
        offer = newOffer('1', amount50);
        bid = newBid('2', amount25);
        balance.submitBid(bid);
        bid.match(offer);
        return balance.funds.compareTo(amount225).should.equal(0);
      });
      return it('should apply commission to deposits as a result of fills', function() {
        var balance, bid, calculateCommission, commissionAccount, offer;

        commissionAccount = new Account({
          id: 'commission'
        });
        calculateCommission = sinon.stub().returns(amount5);
        balance = new Balance({
          commission: {
            account: commissionAccount,
            calculate: calculateCommission
          }
        });
        balance.deposit('200');
        bid = newBid('1', amount25);
        offer = newOffer('2', amount50);
        balance.submitBid(bid);
        offer.match(bid);
        calculateCommission.should.have.been.calledOnce;
        calculateCommission.firstCall.args[0].amount.compareTo(amount25).should.equal(0);
        calculateCommission.firstCall.args[0].timestamp.should.equal(offer.timestamp);
        calculateCommission.firstCall.args[0].account.should.equal(bid.account);
        calculateCommission.firstCall.args[0].currency.should.equal(bid.bidCurrency);
        balance.funds.compareTo(amount220).should.equal(0);
        return commissionAccount.getBalance('BTC').funds.compareTo(amount5).should.equal(0);
      });
    });
    describe('#cancel', function() {
      return it('should unlock the offer amount', function() {
        var balance, offer;

        balance = new Balance();
        balance.deposit('200');
        offer = newOffer('1', amount50);
        balance.submitOffer(offer);
        balance.cancel(offer);
        return balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
      });
    });
    describe('#withdraw', function() {
      it('should subtract the withdrawn amount from the funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit('200');
        balance.submitOffer(newOffer('1', amount50));
        balance.submitOffer(newOffer('2', amount100));
        balance.withdraw('25');
        balance.funds.compareTo(amount175).should.equal(0);
        balance.withdraw('25');
        return balance.funds.compareTo(amount150).should.equal(0);
      });
      return it('should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit('200');
        balance.submitOffer(newOffer('1', amount50));
        balance.submitOffer(newOffer('2', amount100));
        return expect(function() {
          return balance.withdraw('100');
        }).to["throw"]('Cannot withdraw funds that are not available');
      });
    });
    return describe('#export', function() {
      return it('should return a JSON stringifiable object containing a snapshot of the balance', function() {
        var balance, id, json, object, order, _ref, _results;

        balance = new Balance();
        balance.deposit('200');
        balance.submitOffer(newOffer('1', amount50));
        balance.submitOffer(newOffer('2', amount100));
        json = JSON.stringify(balance["export"]());
        object = JSON.parse(json);
        balance.funds.compareTo(new Amount(object.funds)).should.equal(0);
        balance.lockedFunds.compareTo(new Amount(object.lockedFunds)).should.equal(0);
        _ref = object.offers;
        for (id in _ref) {
          order = _ref[id];
          order.should.deep.equal(balance.offers[id]["export"]());
        }
        _results = [];
        for (id in balance.offers) {
          _results.push(object.offers[id].should.be.ok);
        }
        return _results;
      });
    });
  });

}).call(this);
