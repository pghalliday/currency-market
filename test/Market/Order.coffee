Order = require('../../src/Market/Order')
Amount = require('../../src/Market/Amount')

describe 'Order', ->
  it 'should throw an error if the ID is missing', ->
    expect ->
      order = new Order
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
    .to.throw('Order must have an ID')

  it 'should throw an error if the timestamp is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
    .to.throw('Order must have a time stamp')

  it 'should throw an error if the account name is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
    .to.throw('Order must be associated with an account')

  it 'should throw an error if the bid currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
    .to.throw('Order must be associated with a bid currency')

  it 'should throw an error if the offer currency is missing', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        bidPrice: '100',
        bidAmount: '50'
    .to.throw('Order must be associated with an offer currency')

  it 'should throw an error if only a bid price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
    .to.throw('Insufficient information to calculate the order')

  it 'should throw an error if only an offer price is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
    .to.throw('Insufficient information to calculate the order')

  it 'should throw an error if only a bid amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidAmount: '100',
    .to.throw('Insufficient information to calculate the order')

  it 'should throw an error if only a offer amount is given as it is not enough information to calculate the other fields a bid', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerAmount: '100',
    .to.throw('Insufficient information to calculate the order')

  it 'should throw an error if both the bid price and offer price are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        offerPrice: '50',
        bidAmount: '50'
    .to.throw('Can only specify one of offer price and bid price')

  it 'should throw an error if the bid price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        offerAmount: '60',
        bidAmount: '50'
    .to.throw('Cannot specify a price if the offer and bid amounts are also specified')

  it 'should throw an error if the offer price, offer amount and bid amount are given as we do not want to trust the calculations of others', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '60',
        bidAmount: '50'
    .to.throw('Cannot specify a price if the offer and bid amounts are also specified')

  it 'should throw an error if the bid amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '-50'
    .to.throw('bid amount cannot be negative')

  it 'should throw an error if the bid price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '-100',
        bidAmount: '50'
    .to.throw('bid price cannot be negative')

  it 'should throw an error if the offer amount is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '100',
        offerAmount: '-50'
    .to.throw('offer amount cannot be negative')

  it 'should throw an error if the offer price is negative', ->
    expect ->
      order = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        offerPrice: '-100',
        offerAmount: '50'
    .to.throw('offer price cannot be negative')

  it 'should record the id, timestamp, account name, bid currency and offer currency', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidPrice: '100',
      bidAmount: '50'
    order.id.should.equal('123456789')
    order.timestamp.should.equal('987654321')
    order.account.should.equal('name')
    order.bidCurrency.should.equal('BTC')
    order.offerCurrency.should.equal('EUR')    

  it 'should instantiate with a bid price and bid amount calculating the offer amount and the offer price', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidPrice: '100',
      bidAmount: '50'
    order.bidPrice.compareTo(new Amount('100')).should.equal(0)
    order.offerPrice.compareTo(new Amount('0.01')).should.equal(0)
    order.bidAmount.compareTo(new Amount('50')).should.equal(0)
    order.offerAmount.compareTo(new Amount('5000')).should.equal(0)

  it 'should instantiate with an offer price and offer amount calculating the bid amount and the bid price', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      offerPrice: '100',
      offerAmount: '50'
    order.bidPrice.compareTo(new Amount('0.01')).should.equal(0)
    order.offerPrice.compareTo(new Amount('100')).should.equal(0)
    order.bidAmount.compareTo(new Amount('5000')).should.equal(0)
    order.offerAmount.compareTo(new Amount('50')).should.equal(0)

  it 'should instantiate with an offer price and bid amount calculating the offer amount and the bid price', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      offerPrice: '100',
      bidAmount: '50'
    order.bidPrice.compareTo(new Amount('0.01')).should.equal(0)
    order.offerPrice.compareTo(new Amount('100')).should.equal(0)
    order.bidAmount.compareTo(new Amount('50')).should.equal(0)
    order.offerAmount.compareTo(new Amount('0.5')).should.equal(0)

  it 'should instantiate with a bid price and offer amount calculating the bid amount and the offer price', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidPrice: '100',
      offerAmount: '50'
    order.bidPrice.compareTo(new Amount('100')).should.equal(0)
    order.offerPrice.compareTo(new Amount('0.01')).should.equal(0)
    order.bidAmount.compareTo(new Amount('0.5')).should.equal(0)
    order.offerAmount.compareTo(new Amount('50')).should.equal(0)

  it 'should instantiate with a bid amount and offer amount calculating the bid price and the offer price', ->
    order = new Order
      id: '123456789'
      timestamp: '987654321'
      account: 'name',
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidAmount: '100',
      offerAmount: '50'
    order.bidPrice.compareTo(new Amount('0.5')).should.equal(0)
    order.offerPrice.compareTo(new Amount('2')).should.equal(0)
    order.bidAmount.compareTo(new Amount('100')).should.equal(0)
    order.offerAmount.compareTo(new Amount('50')).should.equal(0)

  describe '#equals', ->
    it 'should return true if the orders are identical', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.true

    it 'should return false if the orders have different IDs', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456790'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different timestamps', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654322'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different accounts', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'another name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different bid currencies', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'USD',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different offer currencies', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'USD',
        bidPrice: '100',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different prices', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '150',
        bidAmount: '50'
      order1.equals(order2).should.be.false

    it 'should return false if the orders have different amounts', ->
      order1 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '50'
      order2 = new Order
        id: '123456789'
        timestamp: '987654321'
        account: 'name',
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: '100',
        bidAmount: '100'
      order1.equals(order2).should.be.false
