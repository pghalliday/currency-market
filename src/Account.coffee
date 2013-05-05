Balance = require('./Balance')

module.exports = class Account
  constructor: (id) ->
    @id = id
    @balances = Object.create null

  getBalance: (currency) =>
    if !@balances[currency]
      @balances[currency] = new Balance()
    return @balances[currency]

  deposit: (params) =>
    @getBalance(params.currency).deposit params.amount

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
