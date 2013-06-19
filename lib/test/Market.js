(function() {
  var Account, Amount, Balance, Book, Market, Order, amount1, amount10, amount100, amount1000, amount101, amount1247, amount125, amount1250, amount1497, amount150, amount1500, amount1750, amount199, amount20, amount200, amount2000, amount250, amount2500, amount3, amount300, amount347, amount350, amount4, amount400, amount472, amount475, amount4950, amount499, amount5, amount50, amount500, amount525, amount650, amount750, amount99, amount999, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Market = require('../src/Market');

  Book = require('../src/Book');

  Account = require('../src/Account');

  Balance = require('../src/Balance');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amountPoint5 = new Amount('0.5');

  amount1 = Amount.ONE;

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount10 = new Amount('10');

  amount20 = new Amount('20');

  amount50 = new Amount('50');

  amount99 = new Amount('99');

  amount100 = new Amount('100');

  amount101 = new Amount('101');

  amount125 = new Amount('125');

  amount150 = new Amount('150');

  amount199 = new Amount('199');

  amount200 = new Amount('200');

  amount250 = new Amount('250');

  amount300 = new Amount('300');

  amount347 = new Amount('347');

  amount350 = new Amount('350');

  amount400 = new Amount('400');

  amount472 = new Amount('472');

  amount475 = new Amount('475');

  amount499 = new Amount('499');

  amount500 = new Amount('500');

  amount525 = new Amount('525');

  amount650 = new Amount('650');

  amount750 = new Amount('750');

  amount999 = new Amount('999');

  amount1000 = new Amount('1000');

  amount1247 = new Amount('1247');

  amount1250 = new Amount('1250');

  amount1497 = new Amount('1497');

  amount1500 = new Amount('1500');

  amount1750 = new Amount('1750');

  amount2000 = new Amount('2000');

  amount2500 = new Amount('2500');

  amount4950 = new Amount('4950');

  describe('Market', function() {
    beforeEach(function() {
      this.calculateCommission = sinon.stub().returns(Amount.ONE);
      return this.market = new Market({
        commission: {
          account: 'commission',
          calculate: this.calculateCommission
        }
      });
    });
    describe('#deposit', function() {
      it('should throw an error if no transaction ID is given', function() {
        var _this = this;
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
        return expect(function() {
          return _this.market.deposit({
            id: '123456790',
            account: 'Peter',
            currency: 'BTC',
            amount: amount50
          });
        }).to["throw"]('Must supply timestamp');
      });
      return it('should credit the correct account and currency, record the last transaction ID and emit a deposit event', function() {
        var account, deposit, depositSpy;
        depositSpy = sinon.spy();
        this.market.on('deposit', depositSpy);
        account = this.market.getAccount('Peter');
        account.getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
        account.getBalance('USD').funds.compareTo(Amount.ZERO).should.equal(0);
        account.getBalance('BTC').funds.compareTo(Amount.ZERO).should.equal(0);
        deposit = {
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
        };
        this.market.deposit(deposit);
        this.market.lastTransaction.should.equal('123456790');
        account.getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
        account.getBalance('USD').funds.compareTo(Amount.ZERO).should.equal(0);
        account.getBalance('BTC').funds.compareTo(amount50).should.equal(0);
        depositSpy.should.have.been.calledOnce;
        return depositSpy.firstCall.args[0].should.equal(deposit);
      });
    });
    describe('#withdraw', function() {
      it('should throw an error if no transaction ID is given', function() {
        var _this = this;
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
      return it('should debit the correct account and currency, record the last transaction ID and emit a withdrawal event', function() {
        var account, withdrawal, withdrawalSpy;
        withdrawalSpy = sinon.spy();
        this.market.on('withdrawal', withdrawalSpy);
        account = this.market.getAccount('Peter');
        this.market.deposit({
          id: '123456790',
          timestamp: '987654322',
          account: 'Peter',
          currency: 'BTC',
          amount: amount200
        });
        withdrawal = {
          id: '123456791',
          timestamp: '987654323',
          account: 'Peter',
          currency: 'BTC',
          amount: amount50
        };
        this.market.withdraw(withdrawal);
        this.market.lastTransaction.should.equal('123456791');
        account.getBalance('BTC').funds.compareTo(amount150).should.equal(0);
        withdrawalSpy.should.have.been.calledOnce;
        return withdrawalSpy.firstCall.args[0].should.equal(withdrawal);
      });
    });
    describe('#submit', function() {
      it('should lock the correct funds in the correct account', function() {
        var account;
        account = this.market.getAccount('Peter');
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
        return account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
      });
      it('should record an order, submit it to the correct book, record the last transaction ID and emit an order event', function() {
        var order1, order2, orderSpy;
        orderSpy = sinon.spy();
        this.market.on('order', orderSpy);
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
        order1 = new Order({
          id: '123456793',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        });
        this.market.submit(order1);
        this.market.lastTransaction.should.equal('123456793');
        this.market.getBook('BTC', 'EUR').highest.id.should.equal('123456793');
        order2 = new Order({
          id: '123456794',
          timestamp: '987654322',
          account: 'Paul',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: amount99,
          bidAmount: amount50
        });
        this.market.submit(order2);
        this.market.lastTransaction.should.equal('123456794');
        this.market.getBook('EUR', 'BTC').highest.id.should.equal('123456794');
        orderSpy.should.have.been.calledTwice;
        orderSpy.firstCall.args[0].should.equal(order1);
        return orderSpy.secondCall.args[0].should.equal(order2);
      });
      describe('while executing orders', function() {
        beforeEach(function() {
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
            this.rightOrder = new Order({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amountPoint2,
              offerAmount: amount1000
            });
            return this.market.submit(this.rightOrder);
          });
          describe('and the new (left) price is same', function() {
            describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount the left order is bidding', function() {
                return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount1000
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint2,
                    bidAmount: amount1500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is an offer', function() {
              describe('and the right order is offering exactly the amount the left order is offering', function() {
                return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount200
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering', function() {
                return it('should trade the amount the left order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount100
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering', function() {
                return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount5,
                    offerAmount: amount300
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
          });
          return describe('and the new (left) price is the better', function() {
            describe('and the left order is an offer', function() {
              describe('and the right order is offering exactly the amount that the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount200
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the left order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount100
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
                return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount300
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is offering exactly the amount that the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1000
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is offering more than the left order is bidding', function() {
                return it('should trade the amount the left order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is offering less than the left order is bidding', function() {
                return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
                });
              });
            });
          });
        });
        return describe('where the existing (right) order is a bid', function() {
          beforeEach(function() {
            this.rightOrder = new Order({
              id: '1',
              timestamp: '1',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: amount5,
              bidAmount: amount200
            });
            return this.market.submit(this.rightOrder);
          });
          return describe('and the new (left) price is better', function() {
            describe('and the left order is an offer', function() {
              describe('and the right order is bidding exactly the amount that the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount200
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is offering', function() {
                return it('should trade the amount the left order is offering at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount100
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].bidAmount.compareTo(amount100).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is offering', function() {
                return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    offerPrice: amount4,
                    offerAmount: amount300
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                });
              });
            });
            return describe('and the left order is a bid', function() {
              describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1000
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the left order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').offers['1'].bidAmount.compareTo(amount100).should.equal(0);
                  expect(this.market.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                });
              });
              return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
                return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                  var leftOrder, tradeSpy;
                  tradeSpy = sinon.spy();
                  this.market.on('trade', tradeSpy);
                  leftOrder = new Order({
                    id: '2',
                    timestamp: '2',
                    account: 'Paul',
                    bidCurrency: 'EUR',
                    offerCurrency: 'BTC',
                    bidPrice: amountPoint25,
                    bidAmount: amount1500
                  });
                  this.market.submit(leftOrder);
                  this.calculateCommission.should.have.been.calledTwice;
                  this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                  this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                  this.market.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                  this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                  this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                  this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                  this.market.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                  tradeSpy.should.have.been.calledOnce;
                  tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                  tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                  tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                  tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                  expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                  this.market.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                  this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                  this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                  this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                  return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
                });
              });
            });
          });
        });
      });
      describe('when multiple orders can be matched', function() {
        beforeEach(function() {
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
          this.rightOrder1 = new Order({
            id: '1',
            timestamp: '1',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint2,
            offerAmount: amount500
          });
          this.market.submit(this.rightOrder1);
          this.rightOrder2 = new Order({
            id: '2',
            timestamp: '2',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint25,
            offerAmount: amount500
          });
          this.market.submit(this.rightOrder2);
          this.rightOrder3 = new Order({
            id: '3',
            timestamp: '3',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amountPoint5,
            offerAmount: amount500
          });
          this.market.submit(this.rightOrder3);
          this.rightOrder4 = new Order({
            id: '4',
            timestamp: '4',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount1,
            offerAmount: amount500
          });
          return this.market.submit(this.rightOrder4);
        });
        describe('and the last order can be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function() {
            var leftOrder, tradeSpy;
            tradeSpy = sinon.spy();
            this.market.on('trade', tradeSpy);
            leftOrder = new Order({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amountPoint5,
              bidAmount: amount1250
            });
            this.market.submit(leftOrder);
            this.calculateCommission.callCount.should.equal(6);
            this.calculateCommission.getCall(0).args[0].bidAmount.compareTo(amount100).should.equal(0);
            this.calculateCommission.getCall(0).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(0).args[0].bid.should.equal(this.rightOrder1);
            this.calculateCommission.getCall(1).args[0].bidAmount.compareTo(amount500).should.equal(0);
            this.calculateCommission.getCall(1).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(1).args[0].bid.should.equal(leftOrder);
            this.calculateCommission.getCall(2).args[0].bidAmount.compareTo(amount125).should.equal(0);
            this.calculateCommission.getCall(2).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(2).args[0].bid.should.equal(this.rightOrder2);
            this.calculateCommission.getCall(3).args[0].bidAmount.compareTo(amount500).should.equal(0);
            this.calculateCommission.getCall(3).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(3).args[0].bid.should.equal(leftOrder);
            this.calculateCommission.getCall(4).args[0].bidAmount.compareTo(amount125).should.equal(0);
            this.calculateCommission.getCall(4).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(4).args[0].bid.should.equal(this.rightOrder3);
            this.calculateCommission.getCall(5).args[0].bidAmount.compareTo(amount250).should.equal(0);
            this.calculateCommission.getCall(5).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(5).args[0].bid.should.equal(leftOrder);
            this.market.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
            this.market.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
            tradeSpy.should.have.been.calledThrice;
            tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder1);
            tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
            tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
            tradeSpy.secondCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.secondCall.args[0].offer.should.equal(this.rightOrder2);
            tradeSpy.secondCall.args[0].price.compareTo(amountPoint25).should.equal(0);
            tradeSpy.secondCall.args[0].amount.compareTo(amount500).should.equal(0);
            tradeSpy.thirdCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.thirdCall.args[0].offer.should.equal(this.rightOrder3);
            tradeSpy.thirdCall.args[0].price.compareTo(amountPoint5).should.equal(0);
            tradeSpy.thirdCall.args[0].amount.compareTo(amount250).should.equal(0);
            expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
            expect(this.market.getAccount('Peter').getBalance('EUR').offers['2']).to.not.be.ok;
            this.market.getAccount('Peter').getBalance('EUR').offers['3'].offerAmount.compareTo(amount250).should.equal(0);
            this.market.getAccount('Peter').getBalance('EUR').offers[amount4].offerAmount.compareTo(amount500).should.equal(0);
            expect(this.market.getAccount('Paul').getBalance('BTC').offers[amount5]).to.not.be.ok;
            this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount750).should.equal(0);
            this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount750).should.equal(0);
            this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount347).should.equal(0);
            this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1247).should.equal(0);
            this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount650).should.equal(0);
            return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          });
        });
        return describe('and the last order cannot be completely satisfied', function() {
          return it('should correctly execute as many orders as it can and emit trade events', function() {
            var leftOrder, tradeSpy;
            tradeSpy = sinon.spy();
            this.market.on('trade', tradeSpy);
            leftOrder = new Order({
              id: '5',
              timestamp: '5',
              account: 'Paul',
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amountPoint5,
              bidAmount: amount1750
            });
            this.market.submit(leftOrder);
            this.calculateCommission.callCount.should.equal(6);
            this.calculateCommission.getCall(0).args[0].bidAmount.compareTo(amount100).should.equal(0);
            this.calculateCommission.getCall(0).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(0).args[0].bid.should.equal(this.rightOrder1);
            this.calculateCommission.getCall(1).args[0].bidAmount.compareTo(amount500).should.equal(0);
            this.calculateCommission.getCall(1).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(1).args[0].bid.should.equal(leftOrder);
            this.calculateCommission.getCall(2).args[0].bidAmount.compareTo(amount125).should.equal(0);
            this.calculateCommission.getCall(2).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(2).args[0].bid.should.equal(this.rightOrder2);
            this.calculateCommission.getCall(3).args[0].bidAmount.compareTo(amount500).should.equal(0);
            this.calculateCommission.getCall(3).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(3).args[0].bid.should.equal(leftOrder);
            this.calculateCommission.getCall(4).args[0].bidAmount.compareTo(amount250).should.equal(0);
            this.calculateCommission.getCall(4).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(4).args[0].bid.should.equal(this.rightOrder3);
            this.calculateCommission.getCall(5).args[0].bidAmount.compareTo(amount500).should.equal(0);
            this.calculateCommission.getCall(5).args[0].timestamp.should.equal('5');
            this.calculateCommission.getCall(5).args[0].bid.should.equal(leftOrder);
            this.market.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
            this.market.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
            tradeSpy.should.have.been.calledThrice;
            tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder1);
            tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
            tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
            tradeSpy.secondCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.secondCall.args[0].offer.should.equal(this.rightOrder2);
            tradeSpy.secondCall.args[0].price.compareTo(amountPoint25).should.equal(0);
            tradeSpy.secondCall.args[0].amount.compareTo(amount500).should.equal(0);
            tradeSpy.thirdCall.args[0].bid.should.equal(leftOrder);
            tradeSpy.thirdCall.args[0].offer.should.equal(this.rightOrder3);
            tradeSpy.thirdCall.args[0].price.compareTo(amountPoint5).should.equal(0);
            tradeSpy.thirdCall.args[0].amount.compareTo(amount500).should.equal(0);
            expect(this.market.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
            expect(this.market.getAccount('Peter').getBalance('EUR').offers['2']).to.not.be.ok;
            expect(this.market.getAccount('Peter').getBalance('EUR').offers['3']).to.not.be.ok;
            this.market.getAccount('Peter').getBalance('EUR').offers[amount4].offerAmount.compareTo(amount500).should.equal(0);
            this.market.getAccount('Paul').getBalance('BTC').offers[amount5].bidAmount.compareTo(amount250).should.equal(0);
            this.market.getAccount('Peter').getBalance('EUR').funds.compareTo(amount500).should.equal(0);
            this.market.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
            this.market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount472).should.equal(0);
            this.market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1497).should.equal(0);
            this.market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount525).should.equal(0);
            return this.market.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
          });
        });
      });
      it('should execute BID/OFFER orders correctly and not throw a withdraw error when ? (captured from a failing random performance test)', function() {
        this.market.deposit({
          id: '100010',
          timestamp: '1366758222',
          account: '100000',
          currency: 'EUR',
          amount: new Amount('8236')
        });
        this.market.submit(new Order({
          id: '100012',
          timestamp: '1366758222',
          account: '100000',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: new Amount('116'),
          bidAmount: new Amount('71')
        }));
        this.market.deposit({
          id: '100021',
          timestamp: '1366758222',
          account: '100001',
          currency: 'BTC',
          amount: new Amount('34')
        });
        this.market.submit(new Order({
          id: '100023',
          timestamp: '1366758222',
          account: '100001',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('114'),
          offerAmount: new Amount('34')
        }));
        this.market.deposit({
          id: '100031',
          timestamp: '1366758222',
          account: '100002',
          currency: 'BTC',
          amount: new Amount('52')
        });
        return this.market.submit(new Order({
          id: '100033',
          timestamp: '1366758222',
          account: '100002',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('110'),
          offerAmount: new Amount('52')
        }));
      });
      it('should execute BID/OFFER orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', function() {
        this.market.deposit({
          id: '100011',
          timestamp: '1366758222',
          account: '100000',
          currency: 'BTC',
          amount: new Amount('54')
        });
        this.market.submit(new Order({
          id: '100013',
          timestamp: '1366758222',
          account: '100000',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('89'),
          offerAmount: new Amount('54')
        }));
        this.market.deposit({
          id: '100020',
          timestamp: '1366758222',
          account: '100001',
          currency: 'EUR',
          amount: new Amount('5252')
        });
        this.market.submit(new Order({
          id: '100022',
          timestamp: '1366758222',
          account: '100001',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: new Amount('101'),
          bidAmount: new Amount('52')
        }));
        this.market.deposit({
          id: '100030',
          timestamp: '1366758222',
          account: '100002',
          currency: 'EUR',
          amount: new Amount('4815')
        });
        return this.market.submit(new Order({
          id: '100032',
          timestamp: '1366758222',
          account: '100002',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: new Amount('107'),
          bidAmount: new Amount('45')
        }));
      });
      return it('should execute BID/BID orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', function() {
        this.market.deposit({
          id: '101000',
          timestamp: '1366758222',
          account: '100000',
          currency: 'EUR',
          amount: new Amount('7540')
        });
        this.market.submit(new Order({
          id: '101002',
          timestamp: '1366758222',
          account: '100000',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          bidPrice: new Amount('116'),
          bidAmount: new Amount('65')
        }));
        this.market.deposit({
          id: '101011',
          timestamp: '1366758222',
          account: '100001',
          currency: 'BTC',
          amount: new Amount('47.000000000000000047')
        });
        this.market.submit(new Order({
          id: '101013',
          timestamp: '1366758222',
          account: '100001',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: new Amount('0.009900990099009901'),
          bidAmount: new Amount('4747')
        }));
        this.market.deposit({
          id: '101031',
          timestamp: '1366758222',
          account: '100003',
          currency: 'BTC',
          amount: new Amount('53.99999999999999865')
        });
        return this.market.submit(new Order({
          id: '101033',
          timestamp: '1366758222',
          account: '100003',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: new Amount('0.011235955056179775'),
          bidAmount: new Amount('4806')
        }));
      });
    });
    describe('#cancel', function() {
      it('should unlock the correct funds in the correct account', function() {
        var account;
        account = this.market.getAccount('Peter');
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
        account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
        this.market.cancel({
          id: '123456791',
          timestamp: '987654350',
          order: {
            id: '123456789',
            account: 'Peter',
            offerCurrency: 'EUR'
          }
        });
        return account.getBalance('EUR').lockedFunds.compareTo(amount100).should.equal(0);
      });
      it('should remove the order from the orders collection and from the correct book, record the last transaction ID and emit an cancellation event', function() {
        var cancellation1, cancellation2, cancellationSpy;
        cancellationSpy = sinon.spy();
        this.market.on('cancellation', cancellationSpy);
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
        cancellation1 = {
          id: '123456795',
          timestamp: '987654349',
          order: {
            id: '123456793',
            account: 'Peter',
            offerCurrency: 'EUR'
          }
        };
        this.market.cancel(cancellation1);
        this.market.lastTransaction.should.equal('123456795');
        expect(this.market.getAccount('Peter').getBalance('EUR').offers['123456793']).to.not.be.ok;
        expect(this.market.getBook('BTC', 'EUR').highest).to.not.be.ok;
        cancellation2 = {
          id: '123456796',
          timestamp: '987654350',
          order: {
            id: '123456794',
            account: 'Paul',
            offerCurrency: 'BTC'
          }
        };
        this.market.cancel(cancellation2);
        this.market.lastTransaction.should.equal('123456796');
        expect(this.market.getAccount('Paul').getBalance('BTC').offers['123456794']).to.not.be.ok;
        expect(this.market.getBook('EUR', 'BTC').highest).to.not.be.ok;
        cancellationSpy.should.have.been.calledTwice;
        cancellationSpy.firstCall.args[0].should.equal(cancellation1);
        return cancellationSpy.secondCall.args[0].should.equal(cancellation2);
      });
      return it('should throw an error if the order cannot be found', function() {
        var _this = this;
        return expect(function() {
          return _this.market.cancel({
            id: '123456795',
            timestamp: '987654349',
            order: {
              id: '123456789',
              account: 'Peter',
              offerCurrency: 'EUR'
            }
          });
        }).to["throw"]('Order cannot be found');
      });
    });
    describe('#getAccount', function() {
      return it('should return an Account object associated with the given ID', function() {
        var account1, account2, account3;
        account1 = this.market.getAccount('Peter');
        account1.should.be.an.instanceOf(Account);
        account1.id.should.equal('Peter');
        account2 = this.market.getAccount('Peter');
        account2.should.equal(account1);
        account3 = this.market.getAccount('Paul');
        return account3.should.not.equal(account1);
      });
    });
    describe('#getBook', function() {
      return it('should return a Book object associated with the given bid and offer currencies', function() {
        var book1, book2, book3;
        book1 = this.market.getBook('EUR', 'BTC');
        book1.should.be.an.instanceOf(Book);
        book2 = this.market.getBook('EUR', 'BTC');
        book2.should.equal(book1);
        book3 = this.market.getBook('BTC', 'EUR');
        return book3.should.not.equal(book1);
      });
    });
    return describe('#export', function() {
      it('should return a JSON stringifiable object containing a snapshot of the market', function() {
        var account, bidCurrency, book, books, id, json, object, offerCurrency, _ref, _ref1, _ref2, _results;
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
        json = JSON.stringify(this.market["export"]());
        object = JSON.parse(json);
        object.lastTransaction.should.equal(this.market.lastTransaction);
        _ref = object.accounts;
        for (id in _ref) {
          account = _ref[id];
          account.should.deep.equal(this.market.getAccount(id)["export"]());
        }
        for (id in this.market.accounts) {
          object.accounts[id].should.be.ok;
        }
        _ref1 = object.books;
        for (bidCurrency in _ref1) {
          books = _ref1[bidCurrency];
          for (offerCurrency in books) {
            book = books[offerCurrency];
            book.should.deep.equal(this.market.getBook(bidCurrency, offerCurrency)["export"]());
          }
        }
        _ref2 = this.market.books;
        _results = [];
        for (bidCurrency in _ref2) {
          books = _ref2[bidCurrency];
          _results.push((function() {
            var _results1;
            _results1 = [];
            for (offerCurrency in books) {
              _results1.push(object.books[bidCurrency][offerCurrency].should.be.ok);
            }
            return _results1;
          })());
        }
        return _results;
      });
      return it('should be possible to recreate a market from an exported snapshot', function() {
        var market;
        this.market.deposit({
          id: '1',
          timestamp: '1',
          account: 'Peter',
          currency: 'EUR',
          amount: amount1000
        });
        this.market.deposit({
          id: '2',
          timestamp: '2',
          account: 'Paul',
          currency: 'BTC',
          amount: amount10
        });
        this.market.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Paul',
          offerCurrency: 'BTC',
          bidCurrency: 'EUR',
          offerPrice: amount101,
          offerAmount: amount10
        }));
        this.market.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        }));
        this.market.deposit({
          id: '5',
          timestamp: '5',
          account: 'Paul',
          currency: 'BTC',
          amount: amount10
        });
        market = new Market();
        market["import"](this.market["export"]());
        market.lastTransaction.should.equal(this.market.lastTransaction);
        market.cancel({
          id: '6',
          timestamp: '6',
          order: new Order({
            id: '3',
            timestamp: '3',
            account: 'Paul',
            offerCurrency: 'BTC',
            bidCurrency: 'EUR',
            offerPrice: amount101,
            offerAmount: amount10
          })
        });
        market.submit(new Order({
          id: '7',
          timestamp: '7',
          account: 'Paul',
          offerCurrency: 'BTC',
          bidCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount10
        }));
        market.getAccount('Peter').getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
        market.getAccount('Peter').getBalance('BTC').funds.compareTo(amount10).should.equal(0);
        market.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
        return market.getAccount('Paul').getBalance('BTC').funds.compareTo(amount10).should.equal(0);
      });
    });
  });

}).call(this);
