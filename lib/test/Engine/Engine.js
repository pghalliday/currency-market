(function() {
  var Account, Amount, Balance, Book, Engine, Order, amount1, amount10, amount100, amount1000, amount101, amount1247, amount125, amount1250, amount1497, amount150, amount1500, amount1750, amount199, amount20, amount200, amount2000, amount250, amount2500, amount3, amount300, amount347, amount350, amount4, amount400, amount472, amount475, amount4950, amount499, amount5, amount50, amount500, amount5000, amount525, amount650, amount75, amount750, amount99, amount999, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Engine = require('../../src/Engine/Engine');

  Book = require('../../src/Engine/Book');

  Account = require('../../src/Engine/Account');

  Balance = require('../../src/Engine/Balance');

  Amount = require('../../src/Engine/Amount');

  Order = require('../../src/Engine/Order');

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

  amount75 = new Amount('75');

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

  amount5000 = new Amount('5000');

  describe('Engine', function() {
    beforeEach(function() {
      this.calculateCommission = sinon.stub().returns(Amount.ONE);
      return this.engine = new Engine({
        commission: {
          account: 'commission',
          calculate: this.calculateCommission
        }
      });
    });
    describe('#apply', function() {
      it('should throw an error if no account is given', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            sequence: 0,
            timestamp: 1371737390976
          });
        }).to["throw"]('Account ID must be specified');
      });
      it('should throw an error if no sequence number is given', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            timestamp: 1371737390976
          });
        }).to["throw"]('Must supply a sequence number');
      });
      it('should throw an error if the sequence number is not expected', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976
          });
        }).to["throw"]('Unexpected sequence number');
      });
      it('should throw an error if no timestamp is given', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0
          });
        }).to["throw"]('Must supply a timestamp');
      });
      it('should throw an error if no known operation is specified', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            unknown: {
              currency: 'EUR',
              amount: '5000'
            }
          });
        }).to["throw"]('Unknown operation');
      });
      describe('deposit', function() {
        it('should throw an error if no currency is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                amount: '5000'
              }
            });
          }).to["throw"]('Must supply a currency');
        });
        it('should throw an error if no amount is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                currency: 'EUR'
              }
            });
          }).to["throw"]('Must supply an amount');
        });
        return it('should credit the correct account and currency and emit a delta event', function() {
          var account, deltaSpy, operation;
          deltaSpy = sinon.spy();
          this.engine.on('delta', deltaSpy);
          account = this.engine.getAccount('Peter');
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '5000'
            }
          };
          this.engine.apply(operation);
          account.getBalance('EUR').funds.compareTo(amount5000).should.equal(0);
          deltaSpy.should.have.been.calledOnce;
          deltaSpy.firstCall.args[0].sequence.should.equal(0);
          deltaSpy.firstCall.args[0].operation.should.equal(operation);
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '50'
            }
          };
          this.engine.apply(operation);
          account.getBalance('BTC').funds.compareTo(amount50).should.equal(0);
          deltaSpy.should.have.been.calledTwice;
          deltaSpy.secondCall.args[0].sequence.should.equal(1);
          return deltaSpy.secondCall.args[0].operation.should.equal(operation);
        });
      });
      describe('withdraw', function() {
        it('should throw an error if no currency is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              withdraw: {
                amount: '5000'
              }
            });
          }).to["throw"]('Must supply a currency');
        });
        it('should throw an error if no amount is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              withdraw: {
                currency: 'EUR'
              }
            });
          }).to["throw"]('Must supply an amount');
        });
        return it('should debit the correct account and currency and emit a delta event unless the requested funds are not available', function() {
          var account, deltaSpy, operation,
            _this = this;
          deltaSpy = sinon.spy();
          this.engine.on('delta', deltaSpy);
          account = this.engine.getAccount('Peter');
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '200'
            }
          });
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            withdraw: {
              currency: 'BTC',
              amount: '50'
            }
          };
          this.engine.apply(operation);
          account.getBalance('BTC').funds.compareTo(amount150).should.equal(0);
          deltaSpy.should.have.been.calledTwice;
          deltaSpy.secondCall.args[0].sequence.should.equal(1);
          deltaSpy.secondCall.args[0].operation.should.equal(operation);
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            withdraw: {
              currency: 'BTC',
              amount: '75'
            }
          };
          this.engine.apply(operation);
          account.getBalance('BTC').funds.compareTo(amount75).should.equal(0);
          deltaSpy.should.have.been.calledThrice;
          deltaSpy.thirdCall.args[0].sequence.should.equal(2);
          deltaSpy.thirdCall.args[0].operation.should.equal(operation);
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 3,
            timestamp: 1371737390976,
            withdraw: {
              currency: 'BTC',
              amount: '100'
            }
          };
          return expect(function() {
            return _this.engine.apply(operation);
          }).to["throw"]('Cannot withdraw funds that are not available');
        });
      });
      describe('submit', function() {
        it.only('should lock the correct funds in the correct account', function() {
          var account;
          account = this.engine.getAccount('Peter');
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '200'
            }
          });
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: '100',
              offerAmount: '50'
            }
          });
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'USD',
              offerCurrency: 'EUR',
              offerPrice: '100',
              offerAmount: '100'
            }
          });
          return account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
        });
        it('should record an order, submit it to the correct book and emit a delta event', function() {
          var deltaSpy, order1, order2;
          deltaSpy = sinon.spy();
          this.engine.on('delta', deltaSpy);
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '200'
            }
          });
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '4950'
            }
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
          this.engine.submit(order1);
          this.engine.lastTransaction.should.equal('123456793');
          this.engine.getBook('BTC', 'EUR').highest.id.should.equal('123456793');
          order2 = new Order({
            id: '123456794',
            timestamp: '987654322',
            account: 'Paul',
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            bidPrice: amount99,
            bidAmount: amount50
          });
          this.engine.submit(order2);
          this.engine.lastTransaction.should.equal('123456794');
          this.engine.getBook('EUR', 'BTC').highest.id.should.equal('123456794');
          deltaSpy.should.have.been.calledTwice;
          deltaSpy.firstCall.args[0].should.equal(order1);
          return deltaSpy.secondCall.args[0].should.equal(order2);
        });
        describe('while executing orders', function() {
          beforeEach(function() {
            this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                currency: 'EUR',
                amount: '2000'
              }
            });
            return this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Paul',
              sequence: 1,
              timestamp: 1371737390976,
              deposit: {
                currency: 'BTC',
                amount: '400'
              }
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
              return this.engine.submit(this.rightOrder);
            });
            describe('and the new (left) price is same', function() {
              describe('and the left order is a bid', function() {
                describe('and the right order is offering exactly the amount the left order is bidding', function() {
                  return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint2,
                      bidAmount: amount1000
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is offering more than the left order is bidding', function() {
                  return it('should trade the amount the left order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint2,
                      bidAmount: amount500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is offering less than the left order is bidding', function() {
                  return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint2,
                      bidAmount: amount1500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                  });
                });
              });
              return describe('and the left order is an offer', function() {
                describe('and the right order is offering exactly the amount the left order is offering', function() {
                  return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount5,
                      offerAmount: amount200
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is offering more than the left order is offering', function() {
                  return it('should trade the amount the left order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount5,
                      offerAmount: amount100
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is offering less than the left order is offering', function() {
                  return it('should trade the amount the right order is offering, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount5,
                      offerAmount: amount300
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
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
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount200
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is offering more than the left order is offering multiplied by the right order price', function() {
                  return it('should trade the amount the left order is offering at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount100
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is offering less than the left order is offering multiplied by the right order price', function() {
                  return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount300
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                  });
                });
              });
              return describe('and the left order is a bid', function() {
                describe('and the right order is offering exactly the amount that the left order is bidding', function() {
                  return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount1000
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is offering more than the left order is bidding', function() {
                  return it('should trade the amount the left order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].offerAmount.compareTo(amount500).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is offering less than the left order is bidding', function() {
                  return it('should trade the amount the right order is offering at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount1500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amountPoint2).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount1000).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
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
              return this.engine.submit(this.rightOrder);
            });
            return describe('and the new (left) price is better', function() {
              describe('and the left order is an offer', function() {
                describe('and the right order is bidding exactly the amount that the left order is offering', function() {
                  return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount200
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is bidding more than the left order is offering', function() {
                  return it('should trade the amount the left order is offering at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount100
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].bidAmount.compareTo(amount100).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is bidding less than the left order is offering', function() {
                  return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      offerPrice: amount4,
                      offerAmount: amount300
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].offerAmount.compareTo(amount100).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount100).should.equal(0);
                  });
                });
              });
              return describe('and the left order is a bid', function() {
                describe('and the right order is bidding exactly the amount that the left order is bidding multiplied by the right order price', function() {
                  return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount1000
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                describe('and the right order is bidding more than the left order is bidding multiplied by the right order price', function() {
                  return it('should trade the amount the left order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount100).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount500).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount100).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').offers['1'].bidAmount.compareTo(amount100).should.equal(0);
                    expect(this.engine.getAccount('Paul').getBalance('BTC').offers['2']).to.not.be.ok;
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount99).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount499).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount300).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                  });
                });
                return describe('and the right order is bidding less than the left order is bidding multiplied by the right order price', function() {
                  return it('should trade the amount the right order is bidding at the right order price, apply commission and emit a trade event', function() {
                    var leftOrder, tradeSpy;
                    tradeSpy = sinon.spy();
                    this.engine.on('trade', tradeSpy);
                    leftOrder = new Order({
                      id: '2',
                      timestamp: '2',
                      account: 'Paul',
                      bidCurrency: 'EUR',
                      offerCurrency: 'BTC',
                      bidPrice: amountPoint25,
                      bidAmount: amount1500
                    });
                    this.engine.submit(leftOrder);
                    this.calculateCommission.should.have.been.calledTwice;
                    this.calculateCommission.firstCall.args[0].bidAmount.compareTo(amount200).should.equal(0);
                    this.calculateCommission.firstCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.firstCall.args[0].bid.should.equal(this.rightOrder);
                    this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(Amount.ONE).should.equal(0);
                    this.calculateCommission.secondCall.args[0].bidAmount.compareTo(amount1000).should.equal(0);
                    this.calculateCommission.secondCall.args[0].timestamp.should.equal('2');
                    this.calculateCommission.secondCall.args[0].bid.should.equal(leftOrder);
                    this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(Amount.ONE).should.equal(0);
                    tradeSpy.should.have.been.calledOnce;
                    tradeSpy.firstCall.args[0].bid.should.equal(this.rightOrder);
                    tradeSpy.firstCall.args[0].offer.should.equal(leftOrder);
                    tradeSpy.firstCall.args[0].price.compareTo(amount5).should.equal(0);
                    tradeSpy.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
                    expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
                    this.engine.getAccount('Paul').getBalance('BTC').offers['2'].bidAmount.compareTo(amount500).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
                    this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
                    this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
                    return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
                  });
                });
              });
            });
          });
        });
        describe('when multiple orders can be matched', function() {
          beforeEach(function() {
            this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                currency: 'EUR',
                amount: '2000'
              }
            });
            this.engine.apply({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Paul',
              sequence: 1,
              timestamp: 1371737390976,
              deposit: {
                currency: 'BTC',
                amount: '1000'
              }
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
            this.engine.submit(this.rightOrder1);
            this.rightOrder2 = new Order({
              id: '2',
              timestamp: '2',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amountPoint25,
              offerAmount: amount500
            });
            this.engine.submit(this.rightOrder2);
            this.rightOrder3 = new Order({
              id: '3',
              timestamp: '3',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amountPoint5,
              offerAmount: amount500
            });
            this.engine.submit(this.rightOrder3);
            this.rightOrder4 = new Order({
              id: '4',
              timestamp: '4',
              account: 'Peter',
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount1,
              offerAmount: amount500
            });
            return this.engine.submit(this.rightOrder4);
          });
          describe('and the last order can be completely satisfied', function() {
            return it('should correctly execute as many orders as it can and emit trade events', function() {
              var leftOrder, tradeSpy;
              tradeSpy = sinon.spy();
              this.engine.on('trade', tradeSpy);
              leftOrder = new Order({
                id: '5',
                timestamp: '5',
                account: 'Paul',
                bidCurrency: 'EUR',
                offerCurrency: 'BTC',
                bidPrice: amountPoint5,
                bidAmount: amount1250
              });
              this.engine.submit(leftOrder);
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
              this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
              this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
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
              expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
              expect(this.engine.getAccount('Peter').getBalance('EUR').offers['2']).to.not.be.ok;
              this.engine.getAccount('Peter').getBalance('EUR').offers['3'].offerAmount.compareTo(amount250).should.equal(0);
              this.engine.getAccount('Peter').getBalance('EUR').offers[amount4].offerAmount.compareTo(amount500).should.equal(0);
              expect(this.engine.getAccount('Paul').getBalance('BTC').offers[amount5]).to.not.be.ok;
              this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount750).should.equal(0);
              this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount750).should.equal(0);
              this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount347).should.equal(0);
              this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1247).should.equal(0);
              this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount650).should.equal(0);
              return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
            });
          });
          return describe('and the last order cannot be completely satisfied', function() {
            return it('should correctly execute as many orders as it can and emit trade events', function() {
              var leftOrder, tradeSpy;
              tradeSpy = sinon.spy();
              this.engine.on('trade', tradeSpy);
              leftOrder = new Order({
                id: '5',
                timestamp: '5',
                account: 'Paul',
                bidCurrency: 'EUR',
                offerCurrency: 'BTC',
                bidPrice: amountPoint5,
                bidAmount: amount1750
              });
              this.engine.submit(leftOrder);
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
              this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
              this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
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
              expect(this.engine.getAccount('Peter').getBalance('EUR').offers['1']).to.not.be.ok;
              expect(this.engine.getAccount('Peter').getBalance('EUR').offers['2']).to.not.be.ok;
              expect(this.engine.getAccount('Peter').getBalance('EUR').offers['3']).to.not.be.ok;
              this.engine.getAccount('Peter').getBalance('EUR').offers[amount4].offerAmount.compareTo(amount500).should.equal(0);
              this.engine.getAccount('Paul').getBalance('BTC').offers[amount5].bidAmount.compareTo(amount250).should.equal(0);
              this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount500).should.equal(0);
              this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount500).should.equal(0);
              this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount472).should.equal(0);
              this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1497).should.equal(0);
              this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount525).should.equal(0);
              return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(amount125).should.equal(0);
            });
          });
        });
        it('should execute BID/OFFER orders correctly and not throw a withdraw error when ? (captured from a failing random performance test)', function() {
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '8236'
            }
          });
          this.engine.submit(new Order({
            id: '100012',
            timestamp: '1366758222',
            account: '100000',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: new Amount('116'),
            bidAmount: new Amount('71')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '34'
            }
          });
          this.engine.submit(new Order({
            id: '100023',
            timestamp: '1366758222',
            account: '100001',
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: new Amount('114'),
            offerAmount: new Amount('34')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '52'
            }
          });
          return this.engine.submit(new Order({
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
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '54'
            }
          });
          this.engine.submit(new Order({
            id: '100013',
            timestamp: '1366758222',
            account: '100000',
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: new Amount('89'),
            offerAmount: new Amount('54')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '5252'
            }
          });
          this.engine.submit(new Order({
            id: '100022',
            timestamp: '1366758222',
            account: '100001',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: new Amount('101'),
            bidAmount: new Amount('52')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '4815'
            }
          });
          return this.engine.submit(new Order({
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
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '7540'
            }
          });
          this.engine.submit(new Order({
            id: '101002',
            timestamp: '1366758222',
            account: '100000',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: new Amount('116'),
            bidAmount: new Amount('65')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '47.000000000000000047'
            }
          });
          this.engine.submit(new Order({
            id: '101013',
            timestamp: '1366758222',
            account: '100001',
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            bidPrice: new Amount('0.009900990099009901'),
            bidAmount: new Amount('4747')
          }));
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100003',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '53.99999999999999865'
            }
          });
          return this.engine.submit(new Order({
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
      return describe('cancel', function() {
        it('should unlock the correct funds in the correct account', function() {
          var account;
          account = this.engine.getAccount('Peter');
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '200'
            }
          });
          this.engine.submit(new Order({
            id: '123456789',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          }));
          this.engine.submit(new Order({
            id: '123456790',
            timestamp: '987654322',
            account: 'Peter',
            bidCurrency: 'USD',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount100
          }));
          account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
          this.engine.cancel({
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
          this.engine.on('cancellation', cancellationSpy);
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: '200'
            }
          });
          this.engine.apply({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: '4950'
            }
          });
          this.engine.submit(new Order({
            id: '123456793',
            timestamp: '987654321',
            account: 'Peter',
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: amount100,
            offerAmount: amount50
          }));
          this.engine.submit(new Order({
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
          this.engine.cancel(cancellation1);
          this.engine.lastTransaction.should.equal('123456795');
          expect(this.engine.getAccount('Peter').getBalance('EUR').offers['123456793']).to.not.be.ok;
          expect(this.engine.getBook('BTC', 'EUR').highest).to.not.be.ok;
          cancellation2 = {
            id: '123456796',
            timestamp: '987654350',
            order: {
              id: '123456794',
              account: 'Paul',
              offerCurrency: 'BTC'
            }
          };
          this.engine.cancel(cancellation2);
          this.engine.lastTransaction.should.equal('123456796');
          expect(this.engine.getAccount('Paul').getBalance('BTC').offers['123456794']).to.not.be.ok;
          expect(this.engine.getBook('EUR', 'BTC').highest).to.not.be.ok;
          cancellationSpy.should.have.been.calledTwice;
          cancellationSpy.firstCall.args[0].should.equal(cancellation1);
          return cancellationSpy.secondCall.args[0].should.equal(cancellation2);
        });
        return it('should throw an error if the order cannot be found', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.cancel({
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
    });
    describe('#getAccount', function() {
      return it('should return an Account object associated with the given ID', function() {
        var account1, account2, account3;
        account1 = this.engine.getAccount('Peter');
        account1.should.be.an.instanceOf(Account);
        account1.id.should.equal('Peter');
        account2 = this.engine.getAccount('Peter');
        account2.should.equal(account1);
        account3 = this.engine.getAccount('Paul');
        return account3.should.not.equal(account1);
      });
    });
    describe('#getBook', function() {
      return it('should return a Book object associated with the given bid and offer currencies', function() {
        var book1, book2, book3;
        book1 = this.engine.getBook('EUR', 'BTC');
        book1.should.be.an.instanceOf(Book);
        book2 = this.engine.getBook('EUR', 'BTC');
        book2.should.equal(book1);
        book3 = this.engine.getBook('BTC', 'EUR');
        return book3.should.not.equal(book1);
      });
    });
    return describe('#export', function() {
      it('should return a JSON stringifiable object containing a snapshot of the engine', function() {
        var account, bidCurrency, book, books, id, json, object, offerCurrency, _ref, _ref1, _ref2, _results;
        this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Peter',
          sequence: 0,
          timestamp: 1371737390976,
          deposit: {
            currency: 'EUR',
            amount: '200'
          }
        });
        this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 1,
          timestamp: 1371737390976,
          deposit: {
            currency: 'BTC',
            amount: '4950'
          }
        });
        this.engine.submit(new Order({
          id: '123456793',
          timestamp: '987654321',
          account: 'Peter',
          bidCurrency: 'BTC',
          offerCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount50
        }));
        this.engine.submit(new Order({
          id: '123456794',
          timestamp: '987654322',
          account: 'Paul',
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          bidPrice: amount99,
          bidAmount: amount50
        }));
        json = JSON.stringify(this.engine["export"]());
        object = JSON.parse(json);
        object.lastTransaction.should.equal(this.engine.lastTransaction);
        _ref = object.accounts;
        for (id in _ref) {
          account = _ref[id];
          account.should.deep.equal(this.engine.getAccount(id)["export"]());
        }
        for (id in this.engine.accounts) {
          object.accounts[id].should.be.ok;
        }
        _ref1 = object.books;
        for (bidCurrency in _ref1) {
          books = _ref1[bidCurrency];
          for (offerCurrency in books) {
            book = books[offerCurrency];
            book.should.deep.equal(this.engine.getBook(bidCurrency, offerCurrency)["export"]());
          }
        }
        _ref2 = this.engine.books;
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
      return it('should be possible to recreate a engine from an exported snapshot', function() {
        var engine;
        this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Peter',
          sequence: 0,
          timestamp: 1371737390976,
          deposit: {
            currency: 'EUR',
            amount: '1000'
          }
        });
        this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 1,
          timestamp: 1371737390976,
          deposit: {
            currency: 'BTC',
            amount: '10'
          }
        });
        this.engine.submit(new Order({
          id: '3',
          timestamp: '3',
          account: 'Paul',
          offerCurrency: 'BTC',
          bidCurrency: 'EUR',
          offerPrice: amount101,
          offerAmount: amount10
        }));
        this.engine.submit(new Order({
          id: '4',
          timestamp: '4',
          account: 'Peter',
          offerCurrency: 'EUR',
          bidCurrency: 'BTC',
          bidPrice: amount100,
          bidAmount: amount10
        }));
        this.engine.apply({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 2,
          timestamp: 1371737390976,
          deposit: {
            currency: 'BTC',
            amount: '10'
          }
        });
        engine = new Engine();
        engine["import"](this.engine["export"]());
        engine.lastTransaction.should.equal(this.engine.lastTransaction);
        engine.cancel({
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
        engine.submit(new Order({
          id: '7',
          timestamp: '7',
          account: 'Paul',
          offerCurrency: 'BTC',
          bidCurrency: 'EUR',
          offerPrice: amount100,
          offerAmount: amount10
        }));
        engine.getAccount('Peter').getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
        engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount10).should.equal(0);
        engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
        return engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount10).should.equal(0);
      });
    });
  });

}).call(this);