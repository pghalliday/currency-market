chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert
sinon = require 'sinon'
sinonChai = require 'sinon-chai'
chai.use sinonChai

Balance = require '../../src/Engine/Balance'
Amount = require '../../src/Amount'
Order = require '../../src/Engine/Order'
Account = require '../../src/Engine/Account'

amount5 = new Amount '5'
amount25 = new Amount '25'
amount45 = new Amount '45'
amount50 = new Amount '50'
amount75 = new Amount '75'
amount100 = new Amount '100'
amount125 = new Amount '125'
amount150 = new Amount '150'
amount175 = new Amount '175'
amount200 = new Amount '200'
amount220 = new Amount '220'
amount225 = new Amount '225'
amount350 = new Amount '350'

newOffer = (id, amount) ->
  new Order
    id: id
    timestamp: id
    account: 'name'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    offerAmount: amount
    offerPrice: amount100

newBid = (id, amount) ->
  new Order
    id: id
    timestamp: id
    account: 'name'
    bidCurrency: 'BTC'
    offerCurrency: 'EUR'
    bidAmount: amount
    bidPrice: amount150

describe 'Balance', ->
  it 'should error if no account is specified', ->
    expect =>
      balance = new Balance
        currency: 'EUR'
    .to.throw 'Must supply an account'

  it 'should error if no currency is specified', ->
    expect =>
      balance = new Balance
        account: new Account
          id: 'Peter'
    .to.throw 'Must supply a currency'

  it 'should instantiate with funds of zero and locked funds of zero', ->
    balance = new Balance
      account: new Account
        id: 'Peter'
      currency: 'EUR'
    balance.funds.compareTo(Amount.ZERO).should.equal 0
    balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#deposit', ->
    it 'should add the deposited amount to the funds', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.funds.compareTo(amount200).should.equal 0
      balance.deposit amount150
      balance.funds.compareTo(amount350).should.equal 0

  describe '#lock', ->
    it 'should lock the supplied amount of funds', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount50
      balance.lockedFunds.compareTo(amount50).should.equal 0
      balance.lock amount100
      balance.lockedFunds.compareTo(amount150).should.equal 0

    it 'should throw an error if there are not enough funds available to satisfy the lock', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount100
      expect ->
        balance.lock amount150
      .to.throw('Cannot lock funds that are not available')

  describe '#unlock', ->
    it 'should unlock the supplied amount of funds', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount200
      balance.unlock amount50
      balance.lockedFunds.compareTo(amount150).should.equal 0

  describe '#applyOffer', ->
    it 'should unlock funds and withdraw the correct amount returning the debited amount', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'      
      balance.deposit amount200
      balance.lock amount200
      debit = balance.applyOffer
        amount: amount50
        fundsUnlocked: amount50
      balance.lockedFunds.compareTo(amount150).should.equal 0
      balance.funds.compareTo(amount150).should.equal 0
      debit.amount.should.equal '50'
      debit = balance.applyOffer
        amount: amount50
        fundsUnlocked: amount100
      balance.lockedFunds.compareTo(amount50).should.equal 0
      balance.funds.compareTo(amount100).should.equal 0
      debit.amount.should.equal '50'

  describe '#applyBid', ->
    describe 'without commision', ->
      it 'should deposit the correct amount of funds and return the credited amount', ->
        balance = new Balance
          account: new Account
            id: 'Peter'
          currency: 'EUR'
        credit = balance.applyBid 
          amount: amount50
          timestamp: 1371737390976
        balance.funds.compareTo(amount50).should.equal 0
        credit.amount.should.equal '50'
        expect(credit.commission).to.not.be.ok

    describe 'with commision', ->
      it 'should deposit the correct amount of funds after applying commission and return the credited amount and commision information', ->
        commissionAccount = new Account
          id: 'commission'
        calculateCommission = sinon.stub().returns
          amount: amount5
          reference: 'Flat 5'
        balance = new Balance
          account: new Account
            id: 'Peter'
          currency: 'EUR'
          commission: 
            account: commissionAccount
            calculate: calculateCommission
        credit = balance.applyBid 
          amount: amount50
          timestamp: 1371737390976
        balance.funds.compareTo(amount45).should.equal 0
        credit.amount.should.equal '45'
        credit.commission.amount.should.equal '5'
        credit.commission.reference.should.equal 'Flat 5'
        commissionAccount.getBalance('EUR').funds.compareTo(amount5).should.equal 0

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount50
      balance.lock amount100
      balance.withdraw amount25
      balance.funds.compareTo(amount175).should.equal 0
      balance.withdraw amount25
      balance.funds.compareTo(amount150).should.equal 0

    it 'should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount50
      balance.lock amount100
      expect ->
        balance.withdraw amount100
      .to.throw 'Cannot withdraw funds that are not available'

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the balance', ->
      balance = new Balance
        account: new Account
          id: 'Peter'
        currency: 'EUR'
      balance.deposit amount200
      balance.lock amount50
      balance.lock amount100
      json = JSON.stringify balance.export()
      object = JSON.parse json
      balance.funds.compareTo(new Amount object.funds).should.equal 0
      balance.lockedFunds.compareTo(new Amount object.lockedFunds).should.equal 0


