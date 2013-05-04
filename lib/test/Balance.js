(function() {
  var Amount, Balance, Order, amount100, amount125, amount150, amount175, amount200, amount225, amount25, amount350, amount50, amount75, assert, chai, expect, newBid, newOffer;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  amount25 = new Amount('25');

  amount50 = new Amount('50');

  amount75 = new Amount('75');

  amount100 = new Amount('100');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount175 = new Amount('175');

  amount200 = new Amount('200');

  amount225 = new Amount('225');

  amount350 = new Amount('350');

  newOffer = function(id, amount) {
    return new Order({
      id: id,
      timestamp: '987654321',
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
      timestamp: '987654321',
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
        balance.deposit(amount200);
        balance.funds.compareTo(amount200).should.equal(0);
        balance.deposit(amount150);
        return balance.funds.compareTo(amount350).should.equal(0);
      });
    });
    describe('#submitOffer', function() {
      it('should lock the offer amount and record the offer in the offers collection', function() {
        var balance, offer1, offer2;

        balance = new Balance();
        balance.deposit(amount200);
        offer1 = newOffer('1', amount50);
        balance.submitOffer(offer1);
        balance.offers['1'].should.equals(offer1);
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        offer2 = newOffer('2', amount100);
        balance.submitOffer(offer2);
        balance.offers['2'].should.equals(offer2);
        return balance.lockedFunds.compareTo(amount150).should.equal(0);
      });
      it('should throw an error if there are not enough funds available to satisfy the order', function() {
        var balance;

        balance = new Balance();
        balance.deposit(amount200);
        balance.submitOffer(newOffer('1', amount100));
        return expect(function() {
          return balance.submitOffer(newOffer('2', amount150));
        }).to["throw"]('Cannot lock funds that are not available');
      });
      describe('when a fill event fires', function() {
        return it('should unlock funds and withdraw the correct amount', function() {
          var balance, bid, offer;

          balance = new Balance();
          balance.deposit(amount200);
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
      return describe('when a done event fires', function() {
        return it('should remove the offer from the offers collection', function() {
          var balance, bid, offer;

          balance = new Balance();
          balance.deposit(amount200);
          offer = newOffer('1', amount50);
          balance.submitOffer(offer);
          bid = newBid('2', amount25);
          bid.match(offer);
          balance.lockedFunds.compareTo(amount25).should.equal(0);
          balance.funds.compareTo(amount175).should.equal(0);
          bid = newBid('3', amount50);
          bid.match(offer);
          balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          balance.funds.compareTo(amount150).should.equal(0);
          return expect(balance.offers['1']).to.not.be.ok;
        });
      });
    });
    describe('#submitBid', function() {
      return it('should wait for a fill event and deposit the correct amount of funds', function() {
        var balance, bid, offer;

        balance = new Balance();
        balance.deposit(amount200);
        offer = newOffer('1', amount50);
        bid = newBid('2', amount25);
        balance.submitBid(bid);
        bid.match(offer);
        return balance.funds.compareTo(amount225).should.equal(0);
      });
    });
    describe('#cancel', function() {
      return it('should unlock the offer amount and remove the offer from the offers collection', function() {
        var balance, offer;

        balance = new Balance();
        balance.deposit(amount200);
        offer = newOffer('1', amount50);
        balance.submitOffer(offer);
        balance.cancel(offer);
        balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
        return expect(balance.offers['1']).to.not.be.ok;
      });
    });
    return describe('#withdraw', function() {
      it('should subtract the withdrawn amount from the funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(amount200);
        balance.submitOffer(newOffer('1', amount50));
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        balance.submitOffer(newOffer('2', amount100));
        balance.withdraw(amount25);
        balance.funds.compareTo(amount175).should.equal(0);
        balance.withdraw(amount25);
        return balance.funds.compareTo(amount150).should.equal(0);
      });
      return it('should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', function() {
        var balance;

        balance = new Balance();
        balance.deposit(amount200);
        balance.submitOffer(newOffer('1', amount50));
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        balance.submitOffer(newOffer('2', amount100));
        return expect(function() {
          return balance.withdraw(amount100);
        }).to["throw"]('Cannot withdraw funds that are not available');
      });
    });
  });

}).call(this);
