Balance = require('./Balance')

module.exports = class Account
  constructor: (params) ->
    @balances = Object.create null
    if typeof params.state == 'undefined'
      @id = params.id
      params.currencies.forEach (currency) =>
        @balances[currency] = new Balance()
    else
      @id = params.state.id
      Object.keys(params.state.balances).forEach (currency) =>
        @balances[currency] = new Balance
          state: params.state.balances[currency]

  equals: (account) =>
    equal = true
    if @id == account.id
      Object.keys(@balances).forEach (currency) =>
        if typeof account.balances[currency] == 'undefined'
            equal = false
        else
          if !account.balances[currency].equals @balances[currency]
            equal = false
    else
      equal = false
    return equal

  export: =>
    state = Object.create null
    state.id = @id
    state.balances = Object.create null
    Object.keys(@balances).forEach (currency) =>
      state.balances[currency] = @balances[currency].export()
    return state

