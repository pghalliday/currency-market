chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Account = require('../src/Account')
Balance = require('../src/Balance')
Amount = require('../src/Amount')
Order = require('../src/Order')

amountPoint01 = new Amount '0.01'
amount5 = new Amount '5'
amount10 = new Amount '10'
amount15 = new Amount '15'
amount25 = new Amount '25'
amount50 = new Amount '50'
amount100 = new Amount '100'
amount150 = new Amount '150'
amount175 = new Amount '175'
amount200 = new Amount '200'
amount300 = new Amount '300'
amount500 = new Amount '500'
amount1000 = new Amount '1000'

newOffer = (id, currency, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: 'EUR'
    offerCurrency: currency
    offerAmount: amount
    offerPrice: amount100

newBid = (id, currency, amount) ->
  new Order
    id: id
    timestamp: '987654321'
    account: 'name'
    bidCurrency: currency
    offerCurrency: 'EUR'
    bidAmount: amount
    bidPrice: amount150

describe 'Account', ->
  it 'should instantiate and record the account ID', ->
    account = new Account '1'
    account.id.should.equal '1'

  describe '#submit', ->
    it 'should add an order to the orders collection and lock the appropriate funds', ->
      account = new Account()
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.getBalance('EUR').offers['1'].should.equal order
      account.getBalance('EUR').lockedFunds.compareTo(amount1000).should.equal 0

    describe 'when the order fill event fires', ->
      beforeEach ->
        @account = new Account()
        @account.deposit
          currency: 'EUR'
          amount: amount1000
        @order = new Order
          id: '1'
          timestamp: '1'
          account: '123456789'
          offerCurrency: 'EUR'
          bidCurrency: 'BTC'
          bidPrice: amount100
          bidAmount: amount10
        @account.submit @order

      it 'should adjust the locked funds and make deposits and withdrawals to apply the fill', ->
       order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount5
        order.match @order
        @account.getBalance('EUR').offers['1'].should.equal @order
        @account.getBalance('EUR').lockedFunds.compareTo(amount500).should.equal 0
        @account.getBalance('EUR').funds.compareTo(amount500).should.equal 0
        @account.getBalance('BTC').funds.compareTo(amount5).should.equal 0

      it 'should delete fully filled orders', ->
       order = new Order
          id: '2'
          timestamp: '2'
          account: '12345523'
          offerCurrency: 'BTC'
          bidCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount15
        order.match @order
        expect(@account.getBalance('EUR').offers['1']).to.not.be.ok
        @account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#cancel', ->
    it 'should delete an order and unlock the appropriate funds', ->
      account = new Account()
      account.deposit
        currency: 'EUR'
        amount: amount1000
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.cancel order
      expect(@account.getBalance('EUR').offers['1']).to.not.be.ok
      account.getBalance('EUR').lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#getBalance', ->
    it 'should return a balance object associated with the given currency', ->
      account = new Account()
      balance1 = account.getBalance 'EUR'
      balance1.should.be.an.instanceOf Balance
      balance2 = account.getBalance 'EUR'
      balance1.should.equal balance2
      balance3 = account.getBalance 'USD'
      balance3.should.not.equal balance1

  describe '#deposit', ->
    it 'should add the deposited amount to the funds for the correct currency', ->
      account = new Account()
      account.deposit
        currency: 'BTC'
        amount: amount50
      account.getBalance('BTC').funds.compareTo(amount50).should.equal 0

  describe '#withdraw', ->
    it 'should subtract the withdrawn amount from the funds of the correct currency', ->
      account = new Account()
      account.deposit
        currency: 'BTC'
        amount: amount200
      account.submit newOffer '1', 'BTC', amount50
      account.submit newOffer '2', 'BTC', amount100
      account.withdraw
        currency: 'BTC'
        amount: amount25
      account.getBalance('BTC').funds.compareTo(amount175).should.equal 0
      account.withdraw
        currency: 'BTC'
        amount: amount25
      account.getBalance('BTC').funds.compareTo(amount150).should.equal 0

    it 'should throw an error if the withdrawal amount is greater than the funds available', ->
      account = new Account()
      account.deposit
        currency: 'BTC'
        amount: amount200
      account.submit newOffer '1', 'BTC', amount50
      account.submit newOffer '2', 'BTC', amount100
      expect ->
        account.withdraw
          currency: 'BTC'
          amount: amount100
      .to.throw('Cannot withdraw funds that are not available')

