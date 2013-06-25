Balance = require('./Balance')

module.exports = class Account
  constructor: (params) ->
    if params && params.id
      @id = params.id
      @commission = params.commission
      @balances = Object.create null
    else
      throw new Error 'Account ID must be specified'

  getBalance: (currency) =>
    if !@balances[currency]
      @balances[currency] = new Balance
        commission: @commission
    return @balances[currency]

  deposit: (params) =>
    if params.currency
      if params.amount
        @getBalance(params.currency).deposit params.amount
      else
        throw new Error 'Must supply an amount'
    else
      throw new Error 'Must supply a currency'

  withdraw: (params) =>
    @getBalance(params.currency).withdraw params.amount

  submit: (order) =>
    @getBalance(order.offerCurrency).submitOffer order
    @getBalance(order.bidCurrency).submitBid order

  cancel: (order) =>
    @getBalance(order.offerCurrency).cancel order

  export: =>
    object = Object.create null
    object.id = @id
    object.balances = Object.create null
    for currency, balance of @balances
      object.balances[currency] = balance.export()
    return object
