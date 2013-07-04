Amount = require '../Amount'

module.exports = class Submit
  constructor: (params) ->
    exported = params.exported
    if exported
      params = exported
      bidPrice = exported.bidPrice
      bidAmount = exported.bidAmount
      offerPrice = exported.offerPrice
      offerAmount = exported.offerAmount
      params.bidPrice = if bidPrice then new Amount bidPrice
      params.bidAmount = if bidAmount then new Amount bidAmount
      params.offerPrice = if offerPrice then new Amount offerPrice
      params.offerAmount = if offerAmount then new Amount offerAmount
    @bidCurrency = params.bidCurrency || throw new Error 'Must supply a bid currency'
    @offerCurrency = params.offerCurrency || throw new Error 'Must supply an offer currency'
    @bidPrice = params.bidPrice
    @offerPrice = params.offerPrice
    if @bidPrice
      @bidAmount = params.bidAmount || throw new Error 'Must supply a bid amount with a bid price'
    else if @offerPrice
      @offerAmount = params.offerAmount || throw new Error 'Must supply an offer amount with an offer price'
    else
      throw new Error 'Must supply a bid or offer price'

