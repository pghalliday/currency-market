Balance = require('./Balance')

module.exports = class Account
  constructor: (params) ->
    @id = params.id
    @balances = Object.create null
    params.currencies.forEach (currency) =>
      @balances[currency] = new Balance()

