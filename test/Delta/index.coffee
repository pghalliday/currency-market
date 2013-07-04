chai = require 'chai'
chai.should()
expect = chai.expect

Delta = require '../../src/Delta'
Deposit = require '../../src/Delta/Deposit'
Withdraw = require '../../src/Delta/Withdraw'
Submit = require '../../src/Delta/Submit'
Cancel = require '../../src/Delta/Cancel'
Operation = require '../../src/Operation'

describe 'Delta', ->
  it 'should throw an error if no sequence number is supplied', ->
    expect ->
      delta = new Delta
        operation: new Operation
          reference: 'hello'
          sequence: 0
          timestamp: 1371737390976
          account: 'Peter'
          deposit:
            currency: 'EUR'
            amount: '500'
        result:
          funds: '1500'
    .to.throw 'Must supply a sequence number'

  it 'should throw an error if no operation is supplied', ->
    expect ->
      delta = new Delta
        sequence: 0
        result:
          funds: '1500'
    .to.throw 'Must supply an operation'

  it 'should throw an error if no result is supplied', ->
    expect ->
      delta = new Delta
        sequence: 0
        operation: new Operation
          reference: 'hello'
          sequence: 0
          timestamp: 1371737390976
          account: 'Peter'
          deposit:
            currency: 'EUR'
            amount: '500'
    .to.throw 'Must supply a result'

  it 'should throw an error if an unknown operation is supplied', ->
    expect ->
      delta = new Delta
        sequence: 0
        operation:
          reference: 'hello'
          sequence: 0
          timestamp: 1371737390976
          account: 'Peter'
          unknown: 'blah blah'
        result: 'blah blah'
    .to.throw 'Unknown operation'

  describe 'with operation of type deposit', ->
    it 'should instantiate recording a supplied sequence number, operation and instantiate a Deposit', ->
      operation = new Operation
        reference: 'hello'
        sequence: 0
        timestamp: 1371737390976
        account: 'Peter'
        deposit:
          currency: 'EUR'
          amount: '500'
      delta = new Delta
        sequence: 0
        operation: operation
        result:
          funds: '1500'
      delta.sequence.should.equal 0
      delta.operation.should.equal operation
      delta.result.should.be.an.instanceOf Deposit
      delta.result.funds.should.equal '1500'
