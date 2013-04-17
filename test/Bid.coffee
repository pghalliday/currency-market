Bid = require('../src/Bid')
Amount = require('../src/Amount')

describe 'Bid', ->
  it 'should instantiate with a price, amount and calculate the total', ->
    bid = new Bid
      price: new Amount('100'),
      amount: new Amount('50')
    bid.price.compareTo(new Amount('100')).should.equal(0)
    bid.amount.compareTo(new Amount('50')).should.equal(0)
    bid.total.compareTo(new Amount('5000')).should.equal(0)