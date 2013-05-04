Balance = require('./Balance')

module.exports = class Account
  constructor: (params) ->
    @balances = Object.create null
    if params.id
      if params.timestamp
        if params.currencies
          @id = params.id
          @timestamp = params.timestamp
          params.currencies.forEach (currency) =>
            @balances[currency] = new Balance()
        else
          throw new Error 'Must supply currencies'
      else
        throw new Error 'Must supply timestamp'
    else
      throw new Error 'Must supply transaction ID'

  submit: (order) =>
    @balances[order.offerCurrency].submitOffer order
    @balances[order.bidCurrency].submitBid order

  cancel: (order) =>
    @balances[order.offerCurrency].cancel order
   

