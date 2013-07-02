chai = require 'chai'
chai.should()

Balance = require '../../src/State/Balance'

describe 'Balance', ->
  it 'should instantiate with default funds and locked funds of 0', ->
    balance = new Balance()
    balance.funds.should.equal '0'
    balance.lockedFunds.should.equal '0'

  it 'should instantiate from a known state', ->
    balance = new Balance
      funds: '5000'
      lockedFunds: '3000'
    balance.funds.should.equal '5000'
    balance.lockedFunds.should.equal '3000'
