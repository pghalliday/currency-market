Account = require('../src/Account')
Amount = require('../src/Amount')

module.exports = class Controller
  constructor: (@state) ->
    
  createAccount: (name) ->
    if @state.accounts[name]
      throw new Error('Account already exists')
    else
      @state.accounts[name] = new Account()

  deposit: (params) ->
    account = @state.accounts[params.account]
    if account
      amount = new Amount(params.amount)
      currency = account.currencies[params.currency]
      if typeof currency == 'undefined'
        account.currencies[params.currency] = amount
      else
        account.currencies[params.currency] = currency.add(amount)
    else
      throw new Error('Account does not exist')
