chai = require 'chai'
chai.should()
expect = chai.expect

WithdrawResult = require '../../src/Delta/WithdrawResult'

describe 'WithdrawResult', ->
  it 'should instantiate recording the supplied funds', ->
    withdrawResult = new WithdrawResult
      funds: 'hello'
    withdrawResult.funds.should.equal 'hello'
