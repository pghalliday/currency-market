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
  it 'should instantiate with a collection of balances matching the supported currencies', ->
    account = new Account
      id: '123456789'
      timestamp: '987654321'
      currencies: [
        'EUR'
        'USD'
        'BTC'
      ]
    account.id.should.equal '123456789'
    account.timestamp.should.equal '987654321'
    account.balances['EUR'].should.be.an.instanceOf(Balance)
    account.balances['USD'].should.be.an.instanceOf(Balance)
    account.balances['BTC'].should.be.an.instanceOf(Balance)

  it 'should throw an error if no id is present', ->
    expect =>
      account = new Account
        timestamp: '987654321'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
    .to.throw('Must supply transaction ID')   

  it 'should throw an error if no timestamp is present', ->
    expect =>
      account = new Account
        id: '123456789'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
    .to.throw('Must supply timestamp')   

  it 'should throw an error if no currencies are present', ->
    expect =>
      account = new Account
        id: '123456789'
        timestamp: '987654321'
    .to.throw('Must supply currencies')   

  describe '#submit', ->
    it 'should add an order to the orders collection and lock the appropriate funds', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.balances['EUR'].deposit amount1000
      order = new Order
        id: '1'
        timestamp: '1'
        account: '123456789'
        offerCurrency: 'EUR'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount10
      account.submit order
      account.balances['EUR'].offers['1'].should.equal order
      account.balances['EUR'].lockedFunds.compareTo(amount1000).should.equal 0

    describe 'when the order fill event fires', ->
      beforeEach ->
        @account = new Account
          id: '123456789'
          timestamp: '987654322'
          currencies: [
            'EUR'
            'USD'
            'BTC'
          ]
        @account.balances['EUR'].deposit amount1000
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
        @account.balances['EUR'].offers['1'].should.equal @order
        @account.balances['EUR'].lockedFunds.compareTo(amount500).should.equal 0
        @account.balances['EUR'].funds.compareTo(amount500).should.equal 0
        @account.balances['BTC'].funds.compareTo(amount5).should.equal 0

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
        expect(@account.balances['EUR'].offers['1']).to.not.be.ok
        @account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0

  describe '#cancel', ->
    it 'should delete an order and unlock the appropriate funds', ->
      account = new Account
        id: '123456789'
        timestamp: '987654322'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.balances['EUR'].deposit amount1000
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
      expect(@account.balances['EUR'].offers['1']).to.not.be.ok
      account.balances['EUR'].lockedFunds.compareTo(Amount.ZERO).should.equal 0
