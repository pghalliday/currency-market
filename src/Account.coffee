Balance = require('./Balance')

module.exports = class Account
  constructor: (params) ->
    @balances = Object.create null
    if typeof params.state == 'undefined'
      if typeof params.id == 'undefined'
        throw new Error 'Must supply transaction ID'
      else
        if typeof params.timestamp == 'undefined'
          throw new Error 'Must supply timestamp'
        else
          if typeof params.currencies == 'undefined'
            throw new Error 'Must supply currencies'
          else
            @id = params.id
            @timestamp = params.timestamp
            params.currencies.forEach (currency) =>
              @balances[currency] = new Balance()
    else
      @id = params.state.id
      @timestamp = params.state.timestamp
      Object.keys(params.state.balances).forEach (currency) =>
        @balances[currency] = new Balance
          state: params.state.balances[currency]

  export: =>
    state = Object.create null
    state.id = @id
    state.timestamp = @timestamp
    state.balances = Object.create null
    Object.keys(@balances).forEach (currency) =>
      state.balances[currency] = @balances[currency].export()
    return state

  equals: (account) =>
    equal = true
    if @id == account.id
      if @timestamp == account.timestamp
        Object.keys(@balances).forEach (currency) =>
          if typeof account.balances[currency] == 'undefined'
              equal = false
          else
            if !account.balances[currency].equals @balances[currency]
              equal = false
      else
        equal = false
    else
      equal = false
    return equal
