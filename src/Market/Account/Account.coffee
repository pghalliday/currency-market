Balance = require('./Balance')

module.exports = class Account
  constructor: (currencies) ->
    @balances = Object.create null
    currencies.forEach (currency) =>
      @balances[currency] = new Balance()

