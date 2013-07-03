chai = require 'chai'
chai.should()
expect = chai.expect

DepositResult = require '../../src/Delta/DepositResult'

describe 'DepositResult', ->
  it 'should instantiate recording the supplied funds', ->
    depositResult = new DepositResult
      funds: 'hello'
    depositResult.funds.should.equal 'hello'
