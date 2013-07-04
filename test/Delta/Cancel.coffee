chai = require 'chai'
chai.should()
expect = chai.expect

Cancel = require '../../src/Delta/Cancel'

describe 'Cancel', ->
  it 'should instantiate recording the supplied locked funds', ->
    cancel = new Cancel
      lockedFunds: 'hello'
    cancel.lockedFunds.should.equal 'hello'
