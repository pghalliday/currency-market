chai = require 'chai'
chai.should()

Balance = require '../../src/State/Balance'
Amount = require '../../src/Amount'

describe 'Balance', ->
  it 'should instantiate with default funds and locked funds of 0', ->
    balance = new Balance()
    balance.funds.compareTo(Amount.ZERO).should.equal 0
    balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0

  it 'should instantiate from a known state', ->
    balance = new Balance
      funds: '5000'
      lockedFunds: '3000'
    balance.funds.compareTo(new Amount '5000').should.equal 0
    balance.lockedFunds.compareTo(new Amount '3000').should.equal 0
