chai = require 'chai'
chai.should()
expect = chai.expect

DepositDelta = require '../../src/Delta/DepositDelta'

describe 'DepositDelta', ->
  it 'should instantiate recording the supplied funds', ->
    depositDelta = new DepositDelta
      funds: 'hello'
    depositDelta.funds.should.equal 'hello'
