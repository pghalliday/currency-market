chai = require 'chai'
chai.should()
expect = chai.expect

Deposit = require '../../src/Delta/Deposit'
Amount = require '../../src/Amount'

describe 'Deposit', ->
  it 'should instantiate recording the supplied funds', ->
    deposit = new Deposit
      funds: new Amount '1500'
    deposit.funds.compareTo(new Amount '1500').should.equal 0
    deposit = new Deposit
      exported: JSON.parse JSON.stringify deposit
    deposit.funds.compareTo(new Amount '1500').should.equal 0
