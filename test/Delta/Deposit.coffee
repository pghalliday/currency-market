chai = require 'chai'
chai.should()
expect = chai.expect

Deposit = require '../../src/Delta/Deposit'

describe 'Deposit', ->
  it 'should instantiate recording the supplied funds', ->
    deposit = new Deposit
      funds: 'hello'
    deposit.funds.should.equal 'hello'
