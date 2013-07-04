chai = require 'chai'
chai.should()
expect = chai.expect

Submit = require '../../src/Delta/Submit'
Amount = require '../../src/Amount'

describe 'Submit', ->
  it.skip 'should instantiate recording the supplied locked funds, next higher order sequence and trades', ->
    submit = new Submit
      lockedFunds: new Amount '1100'
      nextHigherOrderSequence: 0
      trades: []
    submit.lockedFunds.compareTo(new Amount '1100').should.equal 0
    submit.nextHigherOrderSequence.should.equal 0
    submit.trades.should.deep.equal []
    submit = new Submit
      exported: JSON.parse JSON.stringify submit
    submit.lockedFunds.compareTo(new Amount '1100').should.equal 0
    submit.nextHigherOrderSequence.should.equal 0
    submit.trades.should.deep.equal []
