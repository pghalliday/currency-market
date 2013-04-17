Market = require('../src/Market')

module.exports = class State
  constructor: ->
    @accounts = Object.create null
    @markets = Object.create null

  getMarket: (params) =>
    bidMarket = @markets[params.bidCurrency]
    if typeof bidMarket == 'undefined'
      @markets[params.bidCurrency] = bidMarket = Object.create null
    offerMarket = bidMarket[params.offerCurrency]
    if typeof offerMarket == 'undefined'
      bidMarket[params.offerCurrency] = offerMarket = new Market()
    return offerMarket
