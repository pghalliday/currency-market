chai = require 'chai'
chai.should()
expect = chai.expect

Account = require '../../src/State/Account'
Balance = require '../../src/State/Balance'

describe 'Account', ->
  it 'should instantiate', ->
    account = new Account()
    account.should.be.ok

  describe '#getBalance', ->
    it 'should create a new balance if it does not exist', ->
      account = new Account()
      balance = account.getBalance 'EUR'
      balance.should.be.an.instanceOf Balance

    it 'should return the corresponding balance if it does exist', ->
      account = new Account()
      balance1 = account.getBalance 'EUR'
      balance2 = account.getBalance 'EUR'
      balance2.should.equal balance1

    it 'should return different balances for different IDs', ->
      account = new Account()
      balanceEUR = account.getBalance 'EUR'
      balanceBTC = account.getBalance 'BTC'
      balanceBTC.should.not.equal balanceEUR

  it 'should instantiate from a known state', ->
    account = new Account
      balances:
        'EUR':
          funds: '5000'
          lockedFunds: '3000'
        'BTC':
          funds: '50'
          lockedFunds: '25'
    account.getBalance('EUR').getFunds().should.equal '5000'
    account.getBalance('EUR').getLockedFunds().should.equal '3000'
    account.getBalance('BTC').getFunds().should.equal '50'
    account.getBalance('BTC').getLockedFunds().should.equal '25'
