chai = require 'chai'
chai.should()
expect = chai.expect

CancelDelta = require '../../src/Delta/CancelDelta'

describe 'CancelDelta', ->
  it 'should instantiate recording the supplied locked funds', ->
    cancelDelta = new CancelDelta
      lockedFunds: 'hello'
    cancelDelta.lockedFunds.should.equal 'hello'
