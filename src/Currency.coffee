Amount = require('../src/Amount')

module.exports = class Currency
  constructor: ->
    @funds = new Amount()
    @reservedFunds = new Amount()
    @bids = Object.create null

  getBids: (name) ->
    bids = @bids[name]
    if typeof bids == 'undefined'
      @bids[name] = bids = []
    return bids
