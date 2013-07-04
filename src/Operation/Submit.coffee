module.exports = class Submit
  constructor: (params) ->
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

