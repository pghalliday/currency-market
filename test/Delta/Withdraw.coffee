chai = require 'chai'
chai.should()
expect = chai.expect

Withdraw = require '../../src/Delta/Withdraw'
Amount = require '../../src/Amount'

describe 'Withdraw', ->
  it 'should instantiate recording the supplied funds', ->
    withdraw = new Withdraw
      funds: new Amount '500'
    withdraw.funds.compareTo(new Amount '500').should.equal 0
    withdraw = new Withdraw
      exported: JSON.parse JSON.stringify withdraw
    withdraw.funds.compareTo(new Amount '500').should.equal 0
