chai = require 'chai'
chai.should()
expect = chai.expect

SubmitDelta = require '../../../src/Delta/SubmitDelta'

describe 'SubmitDelta', ->
  it 'should instantiate recording the supplied locked funds, next higher order sequence and trades', ->
    submitDelta = new SubmitDelta
      lockedFunds: 'hello'
      nextHigherOrderSequence: 'banana'
      trades: 'apple'
    submitDelta.lockedFunds.should.equal 'hello'
    submitDelta.nextHigherOrderSequence.should.equal 'banana'
    submitDelta.trades.should.equal 'apple'
