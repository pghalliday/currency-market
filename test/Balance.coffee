chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Balance = require('../src/Balance')
Amount = require('../src/Amount')
Order = require('../src/Order')

amount25 = new Amount '25'
amount50 = new Amount '50'
amount75 = new Amount '75'
amount100 = new Amount '100'
amount125 = new Amount '125'
amount150 = new Amount '150'
amount175 = new Amount '175'
amount200 = new Amount '200'
amount225 = new Amount '225'
amount350 = new Amount '350'

newOffer = (id, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: 'EUR'
    offerCurrency: 'BTC'
    offerAmount: amount
    offerPrice: amount100

newBid = (id, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: 'BTC'
    offerCurrency: 'EUR'
    bidAmount: amount
    bidPrice: amount150

describe 'Balance', ->
  it 'should instantiate with funds of zero and locked funds of zero', ->
    balance = new Balance()
    balance.funds.compareTo(Amount.ZERO).should.equal 0
    balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#deposit', ->
    it 'should add the deposited amount to the funds', ->
      balance = new Balance()
      balance.deposit amount200
      balance.funds.compareTo(amount200).should.equal 0
      balance.deposit amount150
      balance.funds.compareTo(amount350).should.equal 0

  describe '#submitOffer', ->
    it 'should lock the offer amount and record the offer in the offers collection', ->
      balance = new Balance()
      balance.deposit amount200
      offer1 = newOffer '1', amount50
      balance.submitOffer offer1
      balance.offers['1'].should.equals offer1
      balance.lockedFunds.compareTo(amount50).should.equal 0
      offer2 = newOffer '2', amount100
      balance.submitOffer offer2
      balance.offers['2'].should.equals offer2
      balance.lockedFunds.compareTo(amount150).should.equal 0

    it 'should throw an error if there are not enough funds available to satisfy the order', ->
      balance = new Balance()
      balance.deposit amount200
      balance.submitOffer newOffer '1', amount100
      expect ->
        balance.submitOffer newOffer '2', amount150
      .to.throw('Cannot lock funds that are not available')

    describe 'when a fill event fires', ->
      it 'should unlock funds and withdraw the correct amount', ->
        balance = new Balance()
        balance.deposit amount200
        offer = newOffer '1', amount50
        balance.submitOffer offer
        bid = newBid '2', amount25
        bid.match offer
        balance.lockedFunds.compareTo(amount25).should.equal 0
        balance.funds.compareTo(amount175).should.equal 0
        bid = newBid '3', amount50
        bid.match offer
        balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0
        balance.funds.compareTo(amount150).should.equal 0

    describe 'when a done event fires', ->
      it 'should remove the offer from the offers collection', ->
        balance = new Balance()
        balance.deposit amount200
        offer = newOffer '1', amount50
        balance.submitOffer offer
        bid = newBid '2', amount25
        bid.match offer
        balance.lockedFunds.compareTo(amount25).should.equal 0
        balance.funds.compareTo(amount175).should.equal 0
        bid = newBid '3', amount50
        bid.match offer
        balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0
        balance.funds.compareTo(amount150).should.equal 0
        expect(balance.offers['1']).to.not.be.ok

  describe '#submitBid', ->
    it 'should wait for a fill event and deposit the correct amount of funds', ->
      balance = new Balance()
      balance.deposit amount200
      offer = newOffer '1', amount50
      bid = newBid '2', amount25
      balance.submitBid bid
      bid.match offer
      balance.funds.compareTo(amount225).should.equal 0

  describe '#cancel', ->
    it 'should unlock the offer amount and remove the offer from the offers collection', ->
      balance = new Balance()
      balance.deposit amount200
      offer = newOffer '1', amount50
      balance.submitOffer offer
      balance.cancel offer
      balance.lockedFunds.compareTo(Amount.ZERO).should.equal 0
      expect(balance.offers['1']).to.not.be.ok

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds', ->
      balance = new Balance()
      balance.deposit amount200
      balance.submitOffer newOffer '1', amount50
      balance.submitOffer newOffer '2', amount100
      balance.withdraw amount25
      balance.funds.compareTo(amount175).should.equal 0
      balance.withdraw amount25
      balance.funds.compareTo(amount150).should.equal 0

    it 'should throw an error if the withdrawal amount is greater than the funds available taking into account the locked funds', ->
      balance = new Balance()
      balance.deposit amount200
      balance.submitOffer newOffer '1', amount50
      balance.submitOffer newOffer '2', amount100
      expect ->
        balance.withdraw amount100
      .to.throw('Cannot withdraw funds that are not available')

  describe '#export', ->
    it 'should return a JSON stringifiable object containing a snapshot of the balance', ->
      balance = new Balance()
      balance.deposit amount200
      balance.submitOffer newOffer '1', amount50
      balance.submitOffer newOffer '2', amount100
      json = JSON.stringify balance.export()
      object = JSON.parse json
      balance.funds.compareTo(new Amount object.funds).should.equal 0
      balance.lockedFunds.compareTo(new Amount object.lockedFunds).should.equal 0
      for id, order of object.offers
        order.should.deep.equal balance.offers[id].export()
      for id of balance.offers
        object.offers[id].should.be.ok


