chai = require 'chai'
chai.should()
expect = chai.expect

Withdraw = require '../../src/Delta/Withdraw'

describe 'Withdraw', ->
  it 'should instantiate recording the supplied funds', ->
    withdraw = new Withdraw
      funds: 'hello'
    withdraw.funds.should.equal 'hello'
