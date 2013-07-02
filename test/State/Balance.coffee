chai = require 'chai'
chai.should()

Balance = require '../../src/State/Balance'

describe 'Balance', ->
  it 'should instantiate with default funds and locked funds of 0', ->
    balance = new Balance()
    balance.getFunds().should.equal '0'
    balance.getLockedFunds().should.equal '0'

  describe '#setFunds', ->
    it 'should set the funds to the given amount', ->
      balance = new Balance()
      balance.setFunds '100'
      balance.getFunds().should.equal '100'
      balance.setFunds '200'
      balance.getFunds().should.equal '200'

  describe '#setLockedFunds', ->
    it 'should set the locked funds to the given amount', ->
      balance = new Balance()
      balance.setLockedFunds '100'
      balance.getLockedFunds().should.equal '100'
      balance.setLockedFunds '200'
      balance.getLockedFunds().should.equal '200'

  it 'should instantiate from a known state', ->
    balance = new Balance
      funds: '5000'
      lockedFunds: '3000'
    balance.getFunds().should.equal '5000'
    balance.getLockedFunds().should.equal '3000'
