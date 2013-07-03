chai = require 'chai'
chai.should()
expect = chai.expect

Account = require '../../src/State/Account'
Balance = require '../../src/State/Balance'

describe 'Account', ->
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

  describe 'JSON.stringify', ->
    beforeEach ->
      account = new Account()
      account.orders['hello'] = 'hello'
      balanceEUR = account.getBalance 'EUR'
      balanceEUR.funds = '5000'
      balanceEUR.lockedFunds = '3000'
      balanceBTC = account.getBalance 'BTC'
      balanceBTC.funds = '50'
      balanceBTC.lockedFunds = '25'
      @snapshot = JSON.parse JSON.stringify account

    it 'should return a JSON string with a snapshot of the account balances without orders', ->
      expect(@snapshot.orders).to.not.be.ok

    it 'should be possible to instantiate an account with the same balances from the snapshot', ->
      account = new Account @snapshot
      account.getBalance('EUR').funds.should.equal '5000'
      account.getBalance('EUR').lockedFunds.should.equal '3000'
      account.getBalance('BTC').funds.should.equal '50'
      account.getBalance('BTC').lockedFunds.should.equal '25'
      account.orders.should.deep.equal {}
