chai = require 'chai'
chai.should()
expect = chai.expect

Submit = require '../../src/Delta/Submit'

describe 'Submit', ->
  it 'should instantiate recording the supplied locked funds, next higher order sequence and trades', ->
    submit = new Submit
      lockedFunds: 'hello'
      nextHigherOrderSequence: 'banana'
      trades: 'apple'
    submit.lockedFunds.should.equal 'hello'
    submit.nextHigherOrderSequence.should.equal 'banana'
    submit.trades.should.equal 'apple'
