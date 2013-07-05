(function() {
  var Account, Amount, Balance, Order, amount100, amount125, amount150, amount175, amount200, amount220, amount225, amount25, amount350, amount45, amount5, amount50, amount75, assert, chai, expect, newBid, newOffer, sinon, sinonChai;

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

  amount45 = new Amount('45');

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
    it('should error if no account is specified', function() {
      var _this = this;
      return expect(function() {
        var balance;
        return balance = new Balance({
          currency: 'EUR'
        });
      }).to["throw"]('Must supply an account');
    });
    it('should error if no currency is specified', function() {
      var _this = this;
      return expect(function() {
        var balance;
        return balance = new Balance({
          account: new Account({
            id: 'Peter'
          })
        });
      }).to["throw"]('Must supply a currency');
    });
    it('should instantiate with funds of zero and locked funds of zero', function() {
      var balance;
      balance = new Balance({
        account: new Account({
          id: 'Peter'
        }),
        currency: 'EUR'
      });
      balance.funds.compareTo(Amount.ZERO).should.equal(0);
      return balance.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
    });
    describe('#deposit', function() {
      return it('should add the deposited amount to the funds', function() {
        var balance, funds;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        funds = balance.deposit(amount200);
        funds.compareTo(amount200).should.equal(0);
        balance.funds.compareTo(amount200).should.equal(0);
        funds = balance.deposit(amount150);
        funds.compareTo(amount350).should.equal(0);
        return balance.funds.compareTo(amount350).should.equal(0);
      });
    });
    describe('#lock', function() {
      it('should lock the supplied amount of funds', function() {
        var balance, lockedFunds;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        lockedFunds = balance.lock(amount50);
        lockedFunds.compareTo(amount50).should.equal(0);
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        lockedFunds = balance.lock(amount100);
        lockedFunds.compareTo(amount150).should.equal(0);
        return balance.lockedFunds.compareTo(amount150).should.equal(0);
      });
      return it('should throw an error if there are not enough funds available to satisfy the lock', function() {
        var balance;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount100);
        return expect(function() {
          return balance.lock(amount150);
        }).to["throw"]('Cannot lock funds that are not available');
      });
    });
    describe('#unlock', function() {
      return it('should unlock the supplied amount of funds', function() {
        var balance, lockedFunds;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount200);
        lockedFunds = balance.unlock(amount50);
        lockedFunds.compareTo(amount150).should.equal(0);
        return balance.lockedFunds.compareTo(amount150).should.equal(0);
      });
    });
    describe('#applyOffer', function() {
      return it('should unlock funds and withdraw the correct amount returning the debited amount', function() {
        var balance, debit;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount200);
        debit = balance.applyOffer({
          amount: amount50,
          fundsUnlocked: amount50
        });
        balance.lockedFunds.compareTo(amount150).should.equal(0);
        balance.funds.compareTo(amount150).should.equal(0);
        debit.amount.compareTo(amount50).should.equal(0);
        debit.funds.compareTo(amount150).should.equal(0);
        debit.lockedFunds.compareTo(amount150).should.equal(0);
        debit = balance.applyOffer({
          amount: amount50,
          fundsUnlocked: amount100
        });
        balance.lockedFunds.compareTo(amount50).should.equal(0);
        balance.funds.compareTo(amount100).should.equal(0);
        debit.amount.compareTo(amount50).should.equal(0);
        debit.funds.compareTo(amount100).should.equal(0);
        return debit.lockedFunds.compareTo(amount50).should.equal(0);
      });
    });
    describe('#applyBid', function() {
      describe('without commision', function() {
        return it('should deposit the correct amount of funds and return the credited amount', function() {
          var balance, credit;
          balance = new Balance({
            account: new Account({
              id: 'Peter'
            }),
            currency: 'EUR'
          });
          credit = balance.applyBid({
            amount: amount50,
            timestamp: 1371737390976
          });
          balance.funds.compareTo(amount50).should.equal(0);
          credit.amount.compareTo(amount50).should.equal(0);
          credit.funds.compareTo(amount50).should.equal(0);
          return expect(credit.commission).to.not.be.ok;
        });
      });
      return describe('with commision', function() {
        return it('should deposit the correct amount of funds after applying commission and return the credited amount and commision information', function() {
          var balance, calculateCommission, commissionAccount, credit;
          commissionAccount = new Account({
            id: 'commission'
          });
          calculateCommission = sinon.stub().returns({
            amount: amount5,
            reference: 'Flat 5'
          });
          balance = new Balance({
            account: new Account({
              id: 'Peter'
            }),
            currency: 'EUR',
            commission: {
              account: commissionAccount,
              calculate: calculateCommission
            }
          });
          credit = balance.applyBid({
            amount: amount50,
            timestamp: 1371737390976
          });
          balance.funds.compareTo(amount45).should.equal(0);
          credit.amount.compareTo(amount45).should.equal(0);
          credit.funds.compareTo(amount45).should.equal(0);
          credit.commission.amount.compareTo(amount5).should.equal(0);
          credit.commission.funds.compareTo(amount5).should.equal(0);
          credit.commission.reference.should.equal('Flat 5');
          return commissionAccount.getBalance('EUR').funds.compareTo(amount5).should.equal(0);
        });
      });
    });
    describe('#withdraw', function() {
      it('should subtract the withdrawn amount from the funds', function() {
        var balance, funds;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount50);
        balance.lock(amount100);
        funds = balance.withdraw(amount25);
        funds.compareTo(amount175).should.equal(0);
        balance.funds.compareTo(amount175).should.equal(0);
        funds = balance.withdraw(amount25);
        funds.compareTo(amount150).should.equal(0);
        return balance.funds.compareTo(amount150).should.equal(0);
      });
      return it('should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', function() {
        var balance;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount50);
        balance.lock(amount100);
        return expect(function() {
          return balance.withdraw(amount100);
        }).to["throw"]('Cannot withdraw funds that are not available');
      });
    });
    return describe('JSON.stringify', function() {
      return it('should return a JSON string object containing a snapshot of the balance', function() {
        var balance, json, object;
        balance = new Balance({
          account: new Account({
            id: 'Peter'
          }),
          currency: 'EUR'
        });
        balance.deposit(amount200);
        balance.lock(amount50);
        balance.lock(amount100);
        json = JSON.stringify(balance);
        object = JSON.parse(json);
        balance.funds.compareTo(new Amount(object.funds)).should.equal(0);
        return balance.lockedFunds.compareTo(new Amount(object.lockedFunds)).should.equal(0);
      });
    });
  });

}).call(this);
