chai = require 'chai'
chai.should()
expect = chai.expect

SubmitResult = require '../../../src/Delta/SubmitResult'

describe 'SubmitResult', ->
  it 'should instantiate recording the supplied locked funds, next higher order sequence and trades', ->
    submitResult = new SubmitResult
      lockedFunds: 'hello'
      nextHigherOrderSequence: 'banana'
      trades: 'apple'
    submitResult.lockedFunds.should.equal 'hello'
    submitResult.nextHigherOrderSequence.should.equal 'banana'
    submitResult.trades.should.equal 'apple'
