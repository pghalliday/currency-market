Amount = require('../src/Amount')

module.exports = class Currency
  constructor: (currencies) ->
    @funds = new Amount()
    @reservedFunds = new Amount()
    @deposits = Object.create null
    @withdrawals = Object.create null
    @orders = Object.create null
    currencies.forEach (currency) =>
      @orders[currency] = Object.create null
