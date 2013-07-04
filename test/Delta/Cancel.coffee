chai = require 'chai'
chai.should()
expect = chai.expect

Cancel = require '../../src/Delta/Cancel'
Amount = require '../../src/Amount'

describe 'Cancel', ->
  it 'should instantiate recording the supplied locked funds', ->
    cancel = new Cancel
      lockedFunds: new Amount '1000'
    cancel.lockedFunds.compareTo(new Amount '1000').should.equal 0
    cancel = new Cancel
      exported: JSON.parse JSON.stringify cancel
    cancel.lockedFunds.compareTo(new Amount '1000').should.equal 0
