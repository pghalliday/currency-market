chai = require 'chai'
chai.should()
expect = chai.expect
assert = chai.assert

Order = require('../src/Order')
Amount = require('../src/Amount')

amountPoint01 = new Amount '0.01'

amount3 = new Amount '3'
amount25 = new Amount '25'
amount50 = new Amount '50'
amount75 = new Amount '75'
amount60 = new Amount '60'
amount100 = new Amount '100'
amount101 = new Amount '101'
amount150 = new Amount '150'
amount5000 = new Amount '5000'
amount7500 = new Amount '7500'

amountMinus50 = new Amount '-50'
amountMinus100 = new Amount '-100'

describe 'Order', ->
  it 'should throw an error if the ID is missing', ->
    expect ->
      order = new Order
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must have an ID')

  it 'should throw an error if the timestamp is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must have a time stamp')

  it 'should throw an error if the account id is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with an account')

  it 'should throw an error if the bid currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with a bid currency')

  it 'should throw an error if the offer currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        bidPrice: amount100
        bidAmount: amount50
    .to.throw('Order must be associated with an offer currency')

  it 'should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerAmount: amount100
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if both the bid price and offer price are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        offerPrice: amount50
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount60
        bidAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if only amounts are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
        offerAmount: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if a bid amount and offer price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidAmount: amount100
        offerPrice: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if an offer amount and bid price are specified as we need to know which amount to satisfy if the order is excuted at a better price', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerAmount: amount100
        bidPrice: amount50
    .to.throw('Must specify either bid amount and price or offer amount and price')

  it 'should throw an error if the bid amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amountMinus50
    .to.throw('bid amount cannot be negative')

  it 'should throw an error if the bid price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amountMinus100
        bidAmount: amount50
    .to.throw('bid price cannot be negative')

  it 'should throw an error if the offer amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amountMinus50
    .to.throw('offer amount cannot be negative')

  it 'should throw an error if the offer price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amountMinus100
        offerAmount: amount50
    .to.throw('offer price cannot be negative')

  it 'should record the id, timestamp, account name, bid currency and offer currency', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      bidPrice: amount100
      bidAmount: amount50
    order.id.should.equal '123456789'
    order.timestamp.should.equal '987654321'
    order.account.should.equal 'name'
    order.bidCurrency.should.equal 'BTC'
    order.offerCurrency.should.equal 'EUR'

  it 'should instantiate with a bid price and bid amount calculating the offer amount', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      bidPrice: amount100
      bidAmount: amount50
    order.bidPrice.compareTo(amount100).should.equal 0
    order.bidAmount.compareTo(amount50).should.equal 0
    order.offerAmount.compareTo(amount5000).should.equal 0

  it 'should instantiate with an offer price and offer amount calculating the bid amount', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name'
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      offerPrice: amount100
      offerAmount: amount50
    order.offerPrice.compareTo(amount100).should.equal 0
    order.bidAmount.compareTo(amount5000).should.equal 0
    order.offerAmount.compareTo(amount50).should.equal 0

  describe '#equals', ->
    it 'should return true if the orders are identical', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.true

    it 'should return false if the orders have different IDs', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456790'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different timestamps', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654322'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different accounts', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'another name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different bid currencies', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'USD'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different offer currencies', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'USD'
        bidPrice: amount100
        bidAmount: amount50
      order1.equals(order2).should.be.false

    describe 'with bid orders', ->
      it 'should return false if the orders have different prices', ->
        order1 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: amount100
          bidAmount: amount50
        order2 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: amount150
          bidAmount: amount50
        order1.equals(order2).should.be.false

      it 'should return false if the orders have different amounts', ->
        order1 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: amount100
          bidAmount: amount50
        order2 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: amount100
          bidAmount: amount100
        order1.equals(order2).should.be.false

    describe 'with offer orders', ->
      it 'should return false if the orders have different prices', ->
        order1 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50
        order2 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount150
          offerAmount: amount50
        order1.equals(order2).should.be.false

      it 'should return false if the orders have different amounts', ->
        order1 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount50
        order2 = new Order
          id: '123456789'
          timestamp: '987654321'
          account: 'name'
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: amount100
          offerAmount: amount100
        order1.equals(order2).should.be.false

  it 'should return false if the orders are different types', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount50
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount100
      order1.equals(order2).should.be.false

  describe '#reduceOffer', ->
    it 'should create a copy of the order with the reduced offer amount', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount100
      order.reduceOffer amount25
      order.offerAmount.compareTo(amount75).should.equal 0
      order.bidAmount.compareTo(amount7500).should.equal 0

    it 'should throw an error if the order is reduced to zero or below', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        offerPrice: amount100
        offerAmount: amount100
      expect ->
        order.reduceOffer amount101
      .to.throw('offer amount cannot be negative')

  describe '#reduceBid', ->
    it 'should create a copy of the order with the reduced bid amount', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount100
      order.reduceBid amount25
      order.bidAmount.compareTo(amount75).should.equal 0
      order.offerAmount.compareTo(amount7500).should.equal 0
      
    it 'should throw an error if the order is reduced below zero', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100
        bidAmount: amount100
      expect ->
        order.reduceBid amount101
      .to.throw('bid amount cannot be negative')

  describe '#export', ->
    it 'should export the state of the order as a JSON stringifiable object that can be used to initialise a new order in the exact same state', ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name'
        bidCurrency: 'BTC'
        offerCurrency: 'EUR'
        bidPrice: amount100.divide(amount3)
        bidAmount: amount100
      state = order.export()
      json = JSON.stringify state
      newOrder = new Order
        state: JSON.parse(json)
      newOrder.equals(order).should.be.true


