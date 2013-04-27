chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

CurrencyMarket = require '../src/'

describe 'CurrencyMarket', ->
  describe '#Market', ->
    it 'should construct a market', ->
      market = new CurrencyMarket.Market
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      market.should.be.an.instanceOf CurrencyMarket.Market

  describe '#Account', ->
    it 'should construct an Account', ->
      account = new CurrencyMarket.Account
        id: '123456789'
        timestamp: '987654321'
        key: 'Peter'
        currencies: [
          'EUR'
          'USD'
          'BTC'
        ]
      account.should.be.an.instanceOf CurrencyMarket.Account

  describe '#Amount', ->
    it 'should construct an Amount', ->
      amount = new CurrencyMarket.Amount '200'
      amount.should.be.an.instanceOf CurrencyMarket.Amount

  describe '#Order', ->
    it 'should construct an Order', ->
      order = new CurrencyMarket.Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: new CurrencyMarket.Amount '100'
        bidAmount: new CurrencyMarket.Amount '50'
      order.should.be.an.instanceOf CurrencyMarket.Order
