(function() {
  var Account, Amount, Book, Engine, Operation, amount1, amount10, amount100, amount1000, amount101, amount1247, amount125, amount1250, amount1497, amount150, amount1500, amount1750, amount199, amount20, amount200, amount2000, amount250, amount2500, amount3, amount300, amount347, amount350, amount4, amount400, amount472, amount475, amount4950, amount499, amount5, amount50, amount500, amount5000, amount525, amount650, amount75, amount750, amount9, amount99, amount999, amountPoint2, amountPoint25, amountPoint5, assert, chai, expect, sinon, sinonChai;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  assert = chai.assert;

  sinon = require('sinon');

  sinonChai = require('sinon-chai');

  chai.use(sinonChai);

  Engine = require('../../src/Engine');

  Book = require('../../src/Engine/Book');

  Account = require('../../src/Engine/Account');

  Amount = require('../../src/Amount');

  Operation = require('../../src/Operation');

  amountPoint2 = new Amount('0.2');

  amountPoint25 = new Amount('0.25');

  amountPoint5 = new Amount('0.5');

  amount1 = Amount.ONE;

  amount3 = new Amount('3');

  amount4 = new Amount('4');

  amount5 = new Amount('5');

  amount9 = new Amount('9');

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
      this.calculateCommission = sinon.stub().returns({
        amount: Amount.ONE,
        reference: 'Flat 1'
      });
      return this.engine = new Engine({
        commission: {
          account: 'commission',
          calculate: this.calculateCommission
        }
      });
    });
    describe('#apply', function() {
      it('should throw an error if the sequence number is not expected', function() {
        var _this = this;
        return expect(function() {
          return _this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount1000
            }
          }));
        }).to["throw"]('Unexpected sequence number');
      });
      describe('deposit', function() {
        it('should throw an error if no currency is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                amount: amount5000
              }
            }));
          }).to["throw"]('Must supply a currency');
        });
        it('should throw an error if no amount is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                currency: 'EUR'
              }
            }));
          }).to["throw"]('Must supply an amount');
        });
        return it('should credit the correct account and currency and return the delta', function() {
          var account, delta, operation;
          account = this.engine.getAccount('Peter');
          operation = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount5000
            }
          });
          delta = this.engine.apply(operation);
          account.getBalance('EUR').funds.compareTo(amount5000).should.equal(0);
          delta.sequence.should.equal(0);
          delta.operation.should.equal(operation);
          delta.result.funds.compareTo(amount5000).should.equal(0);
          operation = {
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: amount50
            }
          };
          delta = this.engine.apply(operation);
          account.getBalance('BTC').funds.compareTo(amount50).should.equal(0);
          delta.operation.should.equal(operation);
          delta.sequence.should.equal(1);
          return delta.result.funds.compareTo(amount50).should.equal(0);
        });
      });
      describe('withdraw', function() {
        it('should throw an error if no currency is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              withdraw: {
                amount: amount5000
              }
            }));
          }).to["throw"]('Must supply a currency');
        });
        it('should throw an error if no amount is supplied', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              withdraw: {
                currency: 'EUR'
              }
            }));
          }).to["throw"]('Must supply an amount');
        });
        return it('should debit the correct account and currency and return the delta unless the requested funds are not available', function() {
          var account, delta, operation,
            _this = this;
          account = this.engine.getAccount('Peter');
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: amount200
            }
          }));
          operation = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            withdraw: {
              currency: 'BTC',
              amount: amount50
            }
          });
          delta = this.engine.apply(operation);
          account.getBalance('BTC').funds.compareTo(amount150).should.equal(0);
          delta.sequence.should.equal(1);
          delta.operation.should.equal(operation);
          delta.result.funds.compareTo(amount150).should.equal(0);
          delta = this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            withdraw: {
              currency: 'BTC',
              amount: amount75
            }
          }));
          account.getBalance('BTC').funds.compareTo(amount75).should.equal(0);
          delta.sequence.should.equal(2);
          delta.result.funds.compareTo(amount75).should.equal(0);
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 3,
              timestamp: 1371737390976,
              withdraw: {
                currency: 'BTC',
                amount: amount100
              }
            }));
          }).to["throw"]('Cannot withdraw funds that are not available');
        });
      });
      describe('submit', function() {
        it('should lock the correct funds in the correct account', function() {
          var account;
          account = this.engine.getAccount('Peter');
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount200
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'USD',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount100
            }
          }));
          return account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
        });
        it('should record an order, submit it to the correct book and return the delta', function() {
          var delta, operation;
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount200
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: amount4950
            }
          }));
          operation = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            }
          });
          delta = this.engine.apply(operation);
          this.engine.getBook('BTC', 'EUR').next().sequence.should.equal(2);
          delta.sequence.should.equal(2);
          delta.operation.should.equal(operation);
          expect(delta.result.nextHigherOrderSequence).to.not.be.ok;
          delta.result.lockedFunds.compareTo(amount50).should.equal(0);
          delta.result.trades.should.have.length(0);
          delta = this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 3,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            }
          }));
          this.engine.getBook('BTC', 'EUR').next().sequence.should.equal(2);
          delta.sequence.should.equal(3);
          delta.result.nextHigherOrderSequence.should.equal(2);
          delta.result.lockedFunds.compareTo(amount100).should.equal(0);
          expect(delta.result.trades).to.not.be.ok;
          delta = this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 4,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amount99,
              bidAmount: amount50
            }
          }));
          this.engine.getBook('EUR', 'BTC').next().sequence.should.equal(4);
          delta.sequence.should.equal(4);
          expect(delta.result.nextHigherOrderSequence).to.not.be.ok;
          delta.result.lockedFunds.compareTo(amount4950).should.equal(0);
          return delta.result.trades.should.have.length(0);
        });
        it('should trade matching orders', function() {
          var delta, operation1, operation2;
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount2000
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: amount400
            }
          }));
          operation1 = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amountPoint2,
              offerAmount: amount1000
            }
          });
          this.engine.apply(operation1);
          operation2 = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 3,
            timestamp: 1371737390977,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amountPoint2,
              bidAmount: amount1000
            }
          });
          delta = this.engine.apply(operation2);
          this.calculateCommission.should.have.been.calledTwice;
          this.calculateCommission.firstCall.args[0].amount.compareTo(amount200).should.equal(0);
          this.calculateCommission.firstCall.args[0].timestamp.should.equal(operation2.timestamp);
          this.calculateCommission.firstCall.args[0].account.id.should.equal(operation1.account);
          this.calculateCommission.firstCall.args[0].currency.should.equal(operation1.submit.bidCurrency);
          this.engine.getAccount('commission').getBalance(operation1.submit.bidCurrency).funds.compareTo(Amount.ONE).should.equal(0);
          this.calculateCommission.secondCall.args[0].amount.compareTo(amount1000).should.equal(0);
          this.calculateCommission.secondCall.args[0].timestamp.should.equal(operation2.timestamp);
          this.calculateCommission.secondCall.args[0].account.id.should.equal(operation2.account);
          this.calculateCommission.secondCall.args[0].currency.should.equal(operation2.submit.bidCurrency);
          this.engine.getAccount('commission').getBalance(operation2.submit.bidCurrency).funds.compareTo(Amount.ONE).should.equal(0);
          delta.sequence.should.equal(3);
          expect(delta.nextHigherOrderSequence).to.not.be.ok;
          delta.result.trades.should.have.length(1);
          expect(delta.result.trades[0].left.remainder).to.not.be.ok;
          delta.result.trades[0].left.transaction.debit.amount.compareTo(amount200).should.equal(0);
          delta.result.trades[0].left.transaction.debit.funds.compareTo(amount200).should.equal(0);
          delta.result.trades[0].left.transaction.debit.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          delta.result.trades[0].left.transaction.credit.amount.compareTo(amount999).should.equal(0);
          delta.result.trades[0].left.transaction.credit.funds.compareTo(amount999).should.equal(0);
          delta.result.trades[0].left.transaction.credit.commission.amount.compareTo(amount1).should.equal(0);
          delta.result.trades[0].left.transaction.credit.commission.funds.compareTo(amount1).should.equal(0);
          delta.result.trades[0].left.transaction.credit.commission.reference.should.equal('Flat 1');
          expect(delta.result.trades[0].right.remainder).to.not.be.ok;
          delta.result.trades[0].right.transaction.debit.amount.compareTo(amount1000).should.equal(0);
          delta.result.trades[0].right.transaction.debit.funds.compareTo(amount1000).should.equal(0);
          delta.result.trades[0].right.transaction.debit.lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          delta.result.trades[0].right.transaction.credit.amount.compareTo(amount199).should.equal(0);
          delta.result.trades[0].right.transaction.credit.funds.compareTo(amount199).should.equal(0);
          delta.result.trades[0].right.transaction.credit.commission.amount.compareTo(amount1).should.equal(0);
          delta.result.trades[0].right.transaction.credit.commission.funds.compareTo(amount1).should.equal(0);
          delta.result.trades[0].right.transaction.credit.commission.reference.should.equal('Flat 1');
          expect(this.engine.getAccount('Peter').orders[1]).to.not.be.ok;
          expect(this.engine.getAccount('Paul').orders[2]).to.not.be.ok;
          this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount1000).should.equal(0);
          this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
          this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount199).should.equal(0);
          this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
          this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount200).should.equal(0);
          return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
        });
        describe('when multiple orders can be matched', function() {
          beforeEach(function() {
            this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              deposit: {
                currency: 'EUR',
                amount: amount2000
              }
            }));
            this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Paul',
              sequence: 1,
              timestamp: 1371737390976,
              deposit: {
                currency: 'BTC',
                amount: amount1000
              }
            }));
            this.operation1 = new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 2,
              timestamp: 1371737390976,
              submit: {
                bidCurrency: 'BTC',
                offerCurrency: 'EUR',
                offerPrice: amountPoint2,
                offerAmount: amount500
              }
            });
            this.engine.apply(this.operation1);
            this.operation2 = new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 3,
              timestamp: 1371737390976,
              submit: {
                bidCurrency: 'BTC',
                offerCurrency: 'EUR',
                offerPrice: amountPoint25,
                offerAmount: amount500
              }
            });
            this.engine.apply(this.operation2);
            this.operation3 = new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 4,
              timestamp: 1371737390976,
              submit: {
                bidCurrency: 'BTC',
                offerCurrency: 'EUR',
                offerPrice: amountPoint5,
                offerAmount: amount500
              }
            });
            this.engine.apply(this.operation3);
            this.operation4 = new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 5,
              timestamp: 1371737390976,
              submit: {
                bidCurrency: 'BTC',
                offerCurrency: 'EUR',
                offerPrice: amount1,
                offerAmount: amount500
              }
            });
            return this.engine.apply(this.operation4);
          });
          describe('and the last order can be completely satisfied', function() {
            return it('should correctly execute as many orders as it can and return the delta information including transactions processed', function() {
              var delta, operation;
              operation = new Operation({
                reference: '550e8400-e29b-41d4-a716-446655440000',
                account: 'Paul',
                sequence: 6,
                timestamp: 1371737390977,
                submit: {
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint5,
                  bidAmount: amount1250
                }
              });
              delta = this.engine.apply(operation);
              this.calculateCommission.callCount.should.equal(6);
              this.calculateCommission.getCall(0).args[0].amount.compareTo(amount100).should.equal(0);
              this.calculateCommission.getCall(0).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(0).args[0].account.id.should.equal(this.operation1.account);
              this.calculateCommission.getCall(0).args[0].currency.should.equal(this.operation1.submit.bidCurrency);
              this.calculateCommission.getCall(1).args[0].amount.compareTo(amount500).should.equal(0);
              this.calculateCommission.getCall(1).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(1).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(1).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.calculateCommission.getCall(2).args[0].amount.compareTo(amount125).should.equal(0);
              this.calculateCommission.getCall(2).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(2).args[0].account.id.should.equal(this.operation2.account);
              this.calculateCommission.getCall(2).args[0].currency.should.equal(this.operation2.submit.bidCurrency);
              this.calculateCommission.getCall(3).args[0].amount.compareTo(amount500).should.equal(0);
              this.calculateCommission.getCall(3).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(3).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(3).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.calculateCommission.getCall(4).args[0].amount.compareTo(amount125).should.equal(0);
              this.calculateCommission.getCall(4).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(4).args[0].account.id.should.equal(this.operation3.account);
              this.calculateCommission.getCall(4).args[0].currency.should.equal(this.operation3.submit.bidCurrency);
              this.calculateCommission.getCall(5).args[0].amount.compareTo(amount250).should.equal(0);
              this.calculateCommission.getCall(5).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(5).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(5).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
              this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
              delta.sequence.should.equal(6);
              expect(delta.nextHigherOrderSequence).to.not.be.ok;
              delta.result.trades.should.have.length(3);
              delta.result.trades[0].left.remainder.bidAmount.compareTo(amount750).should.equal(0);
              expect(delta.result.trades[0].right.remainder).to.not.be.ok;
              delta.result.trades[1].left.remainder.bidAmount.compareTo(amount250).should.equal(0);
              expect(delta.result.trades[1].right.remainder).to.not.be.ok;
              expect(delta.result.trades[2].left.remainder).to.not.be.ok;
              delta.result.trades[2].right.remainder.offerAmount.compareTo(amount250).should.equal(0);
              expect(this.engine.getAccount('Peter').orders[2]).to.not.be.ok;
              expect(this.engine.getAccount('Peter').orders[3]).to.not.be.ok;
              this.engine.getAccount('Peter').orders[4].offerAmount.compareTo(amount250).should.equal(0);
              this.engine.getAccount('Peter').orders[5].offerAmount.compareTo(amount500).should.equal(0);
              expect(this.engine.getAccount('Paul').orders[6]).to.not.be.ok;
              this.engine.getAccount('Peter').getBalance('EUR').funds.compareTo(amount750).should.equal(0);
              this.engine.getAccount('Peter').getBalance('EUR').lockedFunds.compareTo(amount750).should.equal(0);
              this.engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount347).should.equal(0);
              this.engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount1247).should.equal(0);
              this.engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount650).should.equal(0);
              return this.engine.getAccount('Paul').getBalance('BTC').lockedFunds.compareTo(Amount.ZERO).should.equal(0);
            });
          });
          return describe('and the last order cannot be completely satisfied', function() {
            return it('should correctly execute as many orders as it can and return the delta information including transactions processed', function() {
              var delta, operation;
              operation = new Operation({
                reference: '550e8400-e29b-41d4-a716-446655440000',
                account: 'Paul',
                sequence: 6,
                timestamp: 1371737390977,
                submit: {
                  bidCurrency: 'EUR',
                  offerCurrency: 'BTC',
                  bidPrice: amountPoint5,
                  bidAmount: amount1750
                }
              });
              delta = this.engine.apply(operation);
              this.calculateCommission.callCount.should.equal(6);
              this.calculateCommission.getCall(0).args[0].amount.compareTo(amount100).should.equal(0);
              this.calculateCommission.getCall(0).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(0).args[0].account.id.should.equal(this.operation1.account);
              this.calculateCommission.getCall(0).args[0].currency.should.equal(this.operation1.submit.bidCurrency);
              this.calculateCommission.getCall(1).args[0].amount.compareTo(amount500).should.equal(0);
              this.calculateCommission.getCall(1).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(1).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(1).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.calculateCommission.getCall(2).args[0].amount.compareTo(amount125).should.equal(0);
              this.calculateCommission.getCall(2).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(2).args[0].account.id.should.equal(this.operation2.account);
              this.calculateCommission.getCall(2).args[0].currency.should.equal(this.operation2.submit.bidCurrency);
              this.calculateCommission.getCall(3).args[0].amount.compareTo(amount500).should.equal(0);
              this.calculateCommission.getCall(3).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(3).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(3).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.calculateCommission.getCall(4).args[0].amount.compareTo(amount250).should.equal(0);
              this.calculateCommission.getCall(4).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(4).args[0].account.id.should.equal(this.operation3.account);
              this.calculateCommission.getCall(4).args[0].currency.should.equal(this.operation3.submit.bidCurrency);
              this.calculateCommission.getCall(5).args[0].amount.compareTo(amount500).should.equal(0);
              this.calculateCommission.getCall(5).args[0].timestamp.should.equal(operation.timestamp);
              this.calculateCommission.getCall(5).args[0].account.id.should.equal(operation.account);
              this.calculateCommission.getCall(5).args[0].currency.should.equal(operation.submit.bidCurrency);
              this.engine.getAccount('commission').getBalance('BTC').funds.compareTo(amount3).should.equal(0);
              this.engine.getAccount('commission').getBalance('EUR').funds.compareTo(amount3).should.equal(0);
              delta.sequence.should.equal(6);
              delta.result.trades[0].left.remainder.bidAmount.compareTo(amount1250).should.equal(0);
              expect(delta.result.trades[0].right.remainder).to.not.be.ok;
              delta.result.trades[1].left.remainder.bidAmount.compareTo(amount750).should.equal(0);
              expect(delta.result.trades[1].right.remainder).to.not.be.ok;
              delta.result.trades[2].left.remainder.bidAmount.compareTo(amount250).should.equal(0);
              expect(delta.result.trades[2].right.remainder).to.not.be.ok;
              expect(this.engine.getAccount('Peter').orders[2]).to.not.be.ok;
              expect(this.engine.getAccount('Peter').orders[3]).to.not.be.ok;
              expect(this.engine.getAccount('Peter').orders[4]).to.not.be.ok;
              this.engine.getAccount('Peter').orders[5].offerAmount.compareTo(amount500).should.equal(0);
              this.engine.getAccount('Paul').orders[6].bidAmount.compareTo(amount250).should.equal(0);
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
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: new Amount('8236')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: new Amount('116'),
              bidAmount: new Amount('71')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: new Amount('34')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 3,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              offerPrice: new Amount('114'),
              offerAmount: new Amount('34')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 4,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: new Amount('52')
            }
          }));
          return this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 5,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              offerPrice: new Amount('110'),
              offerAmount: new Amount('52')
            }
          }));
        });
        it('should execute BID/OFFER orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', function() {
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: new Amount('54')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              offerPrice: new Amount('89'),
              offerAmount: new Amount('54')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: new Amount('5252')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 3,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: new Amount('101'),
              bidAmount: new Amount('52')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 4,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: new Amount('4815')
            }
          }));
          return this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100002',
            sequence: 5,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: new Amount('107'),
              bidAmount: new Amount('45')
            }
          }));
        });
        return it('should execute BID/BID orders correctly and not throw an unlock funds error when ? (captured from a failing random performance test)', function() {
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: new Amount('7540')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100000',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              bidPrice: new Amount('116'),
              bidAmount: new Amount('65')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 2,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: new Amount('47.000000000000000047')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100001',
            sequence: 3,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: new Amount('0.009900990099009901'),
              bidAmount: new Amount('4747')
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100003',
            sequence: 4,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: new Amount('53.99999999999999865')
            }
          }));
          return this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: '100003',
            sequence: 5,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: new Amount('0.011235955056179775'),
              bidAmount: new Amount('4806')
            }
          }));
        });
      });
      return describe('cancel', function() {
        it('should unlock the correct funds in the correct account', function() {
          var account;
          account = this.engine.getAccount('Peter');
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount200
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 1,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'USD',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount100
            }
          }));
          account.getBalance('EUR').lockedFunds.compareTo(amount150).should.equal(0);
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 3,
            timestamp: 1371737390976,
            cancel: {
              sequence: 1
            }
          }));
          return account.getBalance('EUR').lockedFunds.compareTo(amount100).should.equal(0);
        });
        it('should remove the order from the orders collection and from the correct book and return the delta', function() {
          var delta, operation;
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 0,
            timestamp: 1371737390976,
            deposit: {
              currency: 'EUR',
              amount: amount200
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 1,
            timestamp: 1371737390976,
            deposit: {
              currency: 'BTC',
              amount: amount4950
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 2,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'BTC',
              offerCurrency: 'EUR',
              offerPrice: amount100,
              offerAmount: amount50
            }
          }));
          this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 3,
            timestamp: 1371737390976,
            submit: {
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              bidPrice: amount99,
              bidAmount: amount50
            }
          }));
          operation = new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Peter',
            sequence: 4,
            timestamp: 1371737390976,
            cancel: {
              sequence: 2
            }
          });
          delta = this.engine.apply(operation);
          expect(this.engine.getAccount('Peter').orders[2]).to.not.be.ok;
          expect(this.engine.getBook('BTC', 'EUR').next()).to.not.be.ok;
          delta.sequence.should.equal(4);
          delta.operation.should.equal(operation);
          delta = this.engine.apply(new Operation({
            reference: '550e8400-e29b-41d4-a716-446655440000',
            account: 'Paul',
            sequence: 5,
            timestamp: 1371737390976,
            cancel: {
              sequence: 3
            }
          }));
          expect(this.engine.getAccount('Paul').orders[3]).to.not.be.ok;
          expect(this.engine.getBook('EUR', 'BTC').next()).to.not.be.ok;
          return delta.sequence.should.equal(5);
        });
        return it('should throw an error if the order cannot be found', function() {
          var _this = this;
          return expect(function() {
            return _this.engine.apply(new Operation({
              reference: '550e8400-e29b-41d4-a716-446655440000',
              account: 'Peter',
              sequence: 0,
              timestamp: 1371737390976,
              cancel: {
                sequence: 0
              }
            }));
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
    return describe('JSON.stringify', function() {
      return it('should be possible to recreate an engine from an exported snapshot', function() {
        var engine;
        this.engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Peter',
          sequence: 0,
          timestamp: 1371737390976,
          deposit: {
            currency: 'EUR',
            amount: amount1000
          }
        }));
        this.engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 1,
          timestamp: 1371737390976,
          deposit: {
            currency: 'BTC',
            amount: amount10
          }
        }));
        this.engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 2,
          timestamp: 1371737390976,
          submit: {
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: amount101,
            offerAmount: amount10
          }
        }));
        this.engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Peter',
          sequence: 3,
          timestamp: 1371737390976,
          submit: {
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: amount100,
            bidAmount: amount10
          }
        }));
        this.engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 4,
          timestamp: 1371737390976,
          deposit: {
            currency: 'BTC',
            amount: amount10
          }
        }));
        engine = new Engine({
          commission: {
            account: 'commission',
            calculate: this.calculateCommission
          },
          json: JSON.stringify(this.engine)
        });
        engine.nextOperationSequence.should.equal(this.engine.nextOperationSequence);
        engine.nextDeltaSequence.should.equal(this.engine.nextDeltaSequence);
        engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 5,
          timestamp: 1371737390976,
          cancel: {
            sequence: 2
          }
        }));
        engine.apply(new Operation({
          reference: '550e8400-e29b-41d4-a716-446655440000',
          account: 'Paul',
          sequence: 6,
          timestamp: 1371737390976,
          submit: {
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: amount100,
            offerAmount: amount10
          }
        }));
        engine.getAccount('Peter').getBalance('EUR').funds.compareTo(Amount.ZERO).should.equal(0);
        engine.getAccount('Peter').getBalance('BTC').funds.compareTo(amount9).should.equal(0);
        engine.getAccount('Paul').getBalance('EUR').funds.compareTo(amount999).should.equal(0);
        return engine.getAccount('Paul').getBalance('BTC').funds.compareTo(amount10).should.equal(0);
      });
    });
  });

}).call(this);
