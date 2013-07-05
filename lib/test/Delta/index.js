(function() {
  var Amount, Cancel, Delta, Deposit, Operation, Submit, Withdraw, chai, expect;

  chai = require('chai');

  chai.should();

  expect = chai.expect;

  Delta = require('../../src/Delta');

  Deposit = require('../../src/Delta/Deposit');

  Withdraw = require('../../src/Delta/Withdraw');

  Submit = require('../../src/Delta/Submit');

  Cancel = require('../../src/Delta/Cancel');

  Operation = require('../../src/Operation');

  Amount = require('../../src/Amount');

  describe('Delta', function() {
    it('should throw an error if no sequence number is supplied', function() {
      return expect(function() {
        var delta;
        return delta = new Delta({
          operation: new Operation({
            reference: 'hello',
            sequence: 0,
            timestamp: 1371737390976,
            account: 'Peter',
            deposit: {
              currency: 'EUR',
              amount: new Amount('500')
            }
          }),
          result: {
            funds: new Amount('1500')
          }
        });
      }).to["throw"]('Must supply a sequence number');
    });
    it('should throw an error if no operation is supplied', function() {
      return expect(function() {
        var delta;
        return delta = new Delta({
          sequence: 0,
          result: {
            funds: new Amount('1500')
          }
        });
      }).to["throw"]('Must supply an operation');
    });
    it('should throw an error if no result is supplied', function() {
      return expect(function() {
        var delta;
        return delta = new Delta({
          sequence: 0,
          operation: new Operation({
            reference: 'hello',
            sequence: 0,
            timestamp: 1371737390976,
            account: 'Peter',
            deposit: {
              currency: 'EUR',
              amount: new Amount('500')
            }
          })
        });
      }).to["throw"]('Must supply a result');
    });
    it('should throw an error if an unknown operation is supplied', function() {
      return expect(function() {
        var delta;
        return delta = new Delta({
          sequence: 0,
          operation: {
            reference: 'hello',
            sequence: 0,
            timestamp: 1371737390976,
            account: 'Peter',
            unknown: 'blah blah'
          },
          result: 'blah blah'
        });
      }).to["throw"]('Unknown operation');
    });
    describe('with operation of type deposit', function() {
      return it('should instantiate recording a supplied sequence number, operation and instantiate a Deposit', function() {
        var delta, operation;
        operation = new Operation({
          reference: 'hello',
          sequence: 0,
          timestamp: 1371737390976,
          account: 'Peter',
          deposit: {
            currency: 'EUR',
            amount: new Amount('500')
          }
        });
        delta = new Delta({
          sequence: 0,
          operation: operation,
          result: {
            funds: new Amount('1500')
          }
        });
        delta.sequence.should.equal(0);
        delta.operation.should.equal(operation);
        delta.result.should.be.an.instanceOf(Deposit);
        delta.result.funds.compareTo(new Amount('1500')).should.equal(0);
        delta = new Delta({
          json: JSON.stringify(delta)
        });
        delta.sequence.should.equal(0);
        delta.operation.should.be.an.instanceOf(Operation);
        delta.result.should.be.an.instanceOf(Deposit);
        return delta.result.funds.compareTo(new Amount('1500')).should.equal(0);
      });
    });
    describe('with operation of type withdraw', function() {
      return it('should instantiate recording a supplied sequence number, operation and instantiate a Withdraw', function() {
        var delta, operation;
        operation = new Operation({
          reference: 'hello',
          sequence: 0,
          timestamp: 1371737390976,
          account: 'Peter',
          withdraw: {
            currency: 'EUR',
            amount: new Amount('500')
          }
        });
        delta = new Delta({
          sequence: 0,
          operation: operation,
          result: {
            funds: new Amount('500')
          }
        });
        delta.sequence.should.equal(0);
        delta.operation.should.equal(operation);
        delta.result.should.be.an.instanceOf(Withdraw);
        delta.result.funds.compareTo(new Amount('500')).should.equal(0);
        delta = new Delta({
          json: JSON.stringify(delta)
        });
        delta.sequence.should.equal(0);
        delta.operation.should.be.an.instanceOf(Operation);
        delta.result.should.be.an.instanceOf(Withdraw);
        return delta.result.funds.compareTo(new Amount('500')).should.equal(0);
      });
    });
    describe('with operation of type submit', function() {
      return it('should instantiate recording a supplied sequence number, operation and instantiate a Submit', function() {
        var delta, operation;
        operation = new Operation({
          reference: 'hello',
          sequence: 0,
          timestamp: 1371737390976,
          account: 'Peter',
          submit: {
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: new Amount('100'),
            offerAmount: new Amount('50')
          }
        });
        delta = new Delta({
          sequence: 0,
          operation: operation,
          result: {
            lockedFunds: new Amount('1100'),
            trades: []
          }
        });
        delta.sequence.should.equal(0);
        delta.operation.should.equal(operation);
        delta.result.should.be.an.instanceOf(Submit);
        delta.result.lockedFunds.compareTo(new Amount('1100')).should.equal(0);
        delta.result.trades.should.deep.equal([]);
        delta = new Delta({
          json: JSON.stringify(delta)
        });
        delta.sequence.should.equal(0);
        delta.operation.should.be.an.instanceOf(Operation);
        delta.result.should.be.an.instanceOf(Submit);
        delta.result.lockedFunds.compareTo(new Amount('1100')).should.equal(0);
        return delta.result.trades.should.deep.equal([]);
      });
    });
    return describe('with operation of type cancel', function() {
      return it('should instantiate recording a supplied sequence number, operation and instantiate a Cancel', function() {
        var delta, operation;
        operation = new Operation({
          reference: 'hello',
          sequence: 0,
          timestamp: 1371737390976,
          account: 'Peter',
          cancel: {
            sequence: 0
          }
        });
        delta = new Delta({
          sequence: 0,
          operation: operation,
          result: {
            lockedFunds: new Amount('1000')
          }
        });
        delta.sequence.should.equal(0);
        delta.operation.should.equal(operation);
        delta.result.should.be.an.instanceOf(Cancel);
        delta.result.lockedFunds.compareTo(new Amount('1000')).should.equal(0);
        delta = new Delta({
          json: JSON.stringify(delta)
        });
        delta.sequence.should.equal(0);
        delta.operation.should.be.an.instanceOf(Operation);
        delta.result.should.be.an.instanceOf(Cancel);
        return delta.result.lockedFunds.compareTo(new Amount('1000')).should.equal(0);
      });
    });
  });

}).call(this);
