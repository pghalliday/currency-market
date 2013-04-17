State = require('../src/State')
Market = require('../src/Market')

describe 'State', ->
  it 'should instantiate with a collections accounts and markets', ->
    state = new State()
    expect(state.accounts).to.be.an('object')
    expect(state.markets).to.be.an('object')

  describe '#getMarket', ->
    it 'should return a Market instance, creating one if necessary', ->
      state = new State()
      marketBTCEUR = state.getMarket({
        offerCurrency: 'EUR',
        bidCurrency: 'BTC'
      })
      marketBTCEUR.should.be.an.instanceOf(Market)
      marketBTCUSD = state.getMarket({
        offerCurrency: 'USD',
        bidCurrency: 'BTC'
      })
      marketBTCUSD.should.be.an.instanceOf(Market)
      marketEURUSD = state.getMarket({
        offerCurrency: 'USD',
        bidCurrency: 'EUR'
      })
      marketEURUSD.should.be.an.instanceOf(Market)
      marketEURUSD.should.not.equal(marketBTCUSD)
      marketEURUSD.should.not.equal(marketBTCEUR)
      marketBTCUSD.should.not.equal(marketBTCEUR)
      marketBTCEUR2 = state.getMarket({
        offerCurrency: 'EUR',
        bidCurrency: 'BTC'
      })
      marketBTCUSD2 = state.getMarket({
        offerCurrency: 'USD',
        bidCurrency: 'BTC'
      })
      marketEURUSD2 = state.getMarket({
        offerCurrency: 'USD',
        bidCurrency: 'EUR'
      })
      marketBTCEUR2.should.equal(marketBTCEUR)
      marketBTCUSD2.should.equal(marketBTCUSD)
      marketEURUSD2.should.equal(marketEURUSD)
