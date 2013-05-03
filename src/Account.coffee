Balance = require('./Balance')
Order = require('./Order')
Amount = require('./Amount')

module.exports = class Account
  constructor: (params) ->
    @balances = Object.create null
    @orders = Object.create null
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
      params.state.orders.forEach (orderId) =>
        @orders[orderId] = params.orders[orderId]

  export: =>
    state = Object.create null
    state.id = @id
    state.timestamp = @timestamp
    state.balances = Object.create null
    Object.keys(@balances).forEach (currency) =>
      state.balances[currency] = @balances[currency].export()
    state.orders = []
    Object.keys(@orders).forEach (orderId) =>
      state.orders.push orderId
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
        if equal
          Object.keys(@orders).forEach (id) =>
            if account.orders[id]
              if !(@orders[id].equals account.orders[id])
                equal = false
            else
              equal = false
          if equal
            Object.keys(account.orders).forEach (id) =>
              if !@orders[id]
                equal = false
      else
        equal = false
    else
      equal = false
    return equal

  submit: (order) =>
    @balances[order.offerCurrency].submitOffer order
    @balances[order.bidCurrency].submitBid order
    @orders[order.id] = order
    order.on 'done', =>
      delete @orders[order.id]

  cancel: (order) =>
    delete @orders[order.id]
    @balances[order.offerCurrency].cancel order
   

