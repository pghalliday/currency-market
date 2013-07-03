chai = require 'chai'
chai.should()
expect = chai.expect

WithdrawDelta = require '../../src/Delta/WithdrawDelta'

describe 'WithdrawDelta', ->
  it 'should instantiate recording the supplied funds', ->
    withdrawDelta = new WithdrawDelta
      funds: 'hello'
    withdrawDelta.funds.should.equal 'hello'
