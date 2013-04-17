Currency = require('../src/Currency')
Amount = require('../src/Amount')

ZERO = new Amount()

describe 'Currency', ->
  it 'should instantiate with a balance of zero, a reserved balance of zero and an empty collection of bids', ->
    bids = new Currency()
    bids.funds.compareTo(ZERO).should.equal(0)
    bids.reservedFunds.compareTo(ZERO).should.equal(0)
    Object.keys(bids.bids).should.be.empty

  describe '#getBids', ->
    it 'should return an array of bids, creating one if necessary', ->
      currency = new Currency()
      bidsBTC = currency.getBids('BTC')
      bidsBTC.should.be.an('array')
      bidsEUR = currency.getBids('EUR')
      bidsEUR.should.be.an('array')
      bidsUSD = currency.getBids('USD')
      bidsUSD.should.be.an('array')
      bidsUSD.should.not.equal(bidsEUR)
      bidsUSD.should.not.equal(bidsBTC)
      bidsEUR.should.not.equal(bidsBTC)
      bidsBTC2 = currency.getBids('BTC')
      bidsEUR2 = currency.getBids('EUR')
      bidsUSD2 = currency.getBids('USD')
      bidsBTC2.should.equal(bidsBTC)
      bidsEUR2.should.equal(bidsEUR)
      bidsUSD2.should.equal(bidsUSD)
