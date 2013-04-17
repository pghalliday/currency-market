Market = require('../src/Market')

describe 'Market', ->
  it 'should instantiate with a collection of bids', ->
    market = new Market()
    expect(market.bids).to.be.an('object')
