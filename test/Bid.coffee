Bid = require('../src/Bid')
Amount = require('../src/Amount')

describe 'Bid', ->
  it 'should instantiate with a price and an amount', ->
    bid = new Bid
      price: new Amount('100'),
      amount: new Amount('50')
    bid.price.compareTo(new Amount('100')).should.equal(0)
    bid.amount.compareTo(new Amount('50')).should.equal(0)    