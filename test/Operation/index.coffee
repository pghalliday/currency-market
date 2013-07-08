chai = require 'chai'
chai.should()
expect = chai.expect

Operation = require '../../src/Operation'
Deposit = require '../../src/Operation/Deposit'
Withdraw = require '../../src/Operation/Withdraw'
Submit = require '../../src/Operation/Submit'
Cancel = require '../../src/Operation/Cancel'
Amount = require '../../src/Amount'

describe 'Operation', ->
  it 'should error if no account ID is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        deposit: 
          currency: 'EUR'
          amount: new Amount '500'
    .to.throw 'Must supply an account ID'

  it 'should error if an unknown operation is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        unknown: 'blah blah'
    .to.throw 'Unknown operation'

  describe 'of type deposit', ->
    it 'should instantiate recording a supplied reference, sequence number, timestamp, account and instantiate a Deposit', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        deposit:
          currency: 'EUR'
          amount: new Amount '500'
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.deposit.should.be.an.instanceOf Deposit
      operation.deposit.currency.should.equal 'EUR'
      operation.deposit.amount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        json: JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.deposit.should.be.an.instanceOf Deposit
      operation.deposit.currency.should.equal 'EUR'
      operation.deposit.amount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        exported: JSON.parse JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.deposit.should.be.an.instanceOf Deposit
      operation.deposit.currency.should.equal 'EUR'
      operation.deposit.amount.compareTo(new Amount '500').should.equal 0

  describe 'of type withdraw', ->
    it 'should instantiate recording a supplied reference, sequence number, timestamp, account and instantiate a Withdraw', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        withdraw:
          currency: 'EUR'
          amount: new Amount '500'
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.withdraw.should.be.an.instanceOf Withdraw
      operation.withdraw.currency.should.equal 'EUR'
      operation.withdraw.amount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        json: JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.withdraw.should.be.an.instanceOf Withdraw
      operation.withdraw.currency.should.equal 'EUR'
      operation.withdraw.amount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        exported: JSON.parse JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.withdraw.should.be.an.instanceOf Withdraw
      operation.withdraw.currency.should.equal 'EUR'
      operation.withdraw.amount.compareTo(new Amount '500').should.equal 0

  describe 'of type submit', ->
    it 'should instantiate recording a supplied reference, sequence number, timestamp, account and instantiate a Submit', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        submit:
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          bidPrice: new Amount '10'
          bidAmount: new Amount '500'
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.submit.should.be.an.instanceOf Submit
      operation.submit.bidCurrency.should.equal 'EUR'
      operation.submit.offerCurrency.should.equal 'BTC'
      operation.submit.bidPrice.compareTo(new Amount '10').should.equal 0
      operation.submit.bidAmount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        json: JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.submit.should.be.an.instanceOf Submit
      operation.submit.bidCurrency.should.equal 'EUR'
      operation.submit.offerCurrency.should.equal 'BTC'
      operation.submit.bidPrice.compareTo(new Amount '10').should.equal 0
      operation.submit.bidAmount.compareTo(new Amount '500').should.equal 0
      operation = new Operation
        exported: JSON.parse JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.submit.should.be.an.instanceOf Submit
      operation.submit.bidCurrency.should.equal 'EUR'
      operation.submit.offerCurrency.should.equal 'BTC'
      operation.submit.bidPrice.compareTo(new Amount '10').should.equal 0
      operation.submit.bidAmount.compareTo(new Amount '500').should.equal 0

  describe 'of type cancel', ->
    it 'should instantiate recording a supplied reference, sequence number, timestamp, account and instantiate a Cancel', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        cancel:
          sequence: 10
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.cancel.should.be.an.instanceOf Cancel
      operation.cancel.sequence.should.equal 10
      operation = new Operation
        json: JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.cancel.should.be.an.instanceOf Cancel
      operation.cancel.sequence.should.equal 10
      operation = new Operation
        exported: JSON.parse JSON.stringify operation
      operation.reference.should.equal 'hello'
      operation.account.should.equal 'Peter'
      operation.cancel.should.be.an.instanceOf Cancel
      operation.cancel.sequence.should.equal 10

  describe '#accept', ->
    it 'should error if no sequence is supplied', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        deposit: 
          currency: 'EUR'
          amount: new Amount '500'
      expect ->
        operation.accept
          timestamp: 1371737390976
      .to.throw 'Must supply a sequence number'

    it 'should error if no timestamp is supplied', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        deposit: 
          currency: 'EUR'
          amount: new Amount '500'
      expect ->
        operation.accept
          sequence: 0
      .to.throw 'Must supply a timestamp'

    it 'should set the sequence number and timestamp', ->
      operation = new Operation
        reference: 'hello'
        account: 'Peter'
        deposit:
          currency: 'EUR'
          amount: new Amount '500'
      operation.accept
        sequence: 0
        timestamp: 1371737390976
      operation.sequence.should.equal 0
      operation.timestamp.should.equal 1371737390976
      operation = new Operation
        json: JSON.stringify operation
      operation.sequence.should.equal 0
      operation.timestamp.should.equal 1371737390976
      operation = new Operation
        exported: JSON.parse JSON.stringify operation
      operation.sequence.should.equal 0
      operation.timestamp.should.equal 1371737390976
