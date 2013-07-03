chai = require 'chai'
chai.should()
expect = chai.expect

CancelResult = require '../../src/Delta/CancelResult'

describe 'CancelResult', ->
  it 'should instantiate recording the supplied locked funds', ->
    cancelResult = new CancelResult
      lockedFunds: 'hello'
    cancelResult.lockedFunds.should.equal 'hello'
