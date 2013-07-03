Balance = require './Balance'

module.exports = class Account
  constructor: (account) ->
    @balances = {}
    @orders = {}
    if account
      for currency, balance of account.balances
        @balances[currency] = new Balance balance

  getBalance: (currency) =>
    @balances[currency] = @balances[currency] || new Balance()

  toJSON: =>
    object = 
      balances: @balances