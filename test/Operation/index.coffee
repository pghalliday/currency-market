chai = require 'chai'
chai.should()
expect = chai.expect

Operation = require '../../src/Operation'

describe 'Operation', ->
  it 'should error if no sequence is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        timestamp: 1371737390976
        account: 'Peter'
        deposit: 'my deposit'
        withdraw: 'my withdraw'
        submit: 'my submit'
        cancel: 'my cancel'
    .to.throw 'Must supply a sequence number'

  it 'should error if no timestamp is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        sequence: 0
        account: 'Peter'
        deposit: 'my deposit'
        withdraw: 'my withdraw'
        submit: 'my submit'
        cancel: 'my cancel'
    .to.throw 'Must supply a timestamp'

  it 'should error if no account ID is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        sequence: 0
        timestamp: 1371737390976
        deposit: 'my deposit'
        withdraw: 'my withdraw'
        submit: 'my submit'
        cancel: 'my cancel'
    .to.throw 'Must supply an account ID'

  it 'should error if an unknown operation is supplied', ->
    expect ->
      operation = new Operation
        reference: 'hello'
        sequence: 0
        timestamp: 1371737390976
        account: 'Peter'
        unknown: 'blah blah'
    .to.throw 'Unknown operation'

  it 'should instantiate recording a supplied reference, sequence number, timestamp, account and the operation', ->
    operation = new Operation
      reference: 'hello'
      sequence: 0
      timestamp: 1371737390976
      account: 'Peter'
      deposit: 'my deposit'
      withdraw: 'my withdraw'
      submit: 'my submit'
      cancel: 'my cancel'
    operation.reference.should.equal 'hello'
    operation.sequence.should.equal 0
    operation.timestamp.should.equal 1371737390976
    operation.account.should.equal 'Peter'
    operation.deposit.should.equal 'my deposit'
    operation.withdraw.should.equal 'my withdraw'
    operation.submit.should.equal 'my submit'
    operation.cancel.should.equal 'my cancel'
