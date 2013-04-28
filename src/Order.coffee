Amount = require('./Amount')

module.exports = class Order
  constructor: (params) ->
    if typeof params.state == 'undefined'
      @id =  params.id
      if typeof @id == 'undefined'
        throw new Error('Order must have an ID')

      @timestamp = params.timestamp
      if typeof @timestamp == 'undefined'
        throw new Error('Order must have a time stamp')

      @account = params.account
      if typeof @account == 'undefined'
        throw new Error('Order must be associated with an account')

      @bidCurrency = params.bidCurrency
      if typeof @bidCurrency == 'undefined'
        throw new Error('Order must be associated with a bid currency')

      @offerCurrency = params.offerCurrency
      if typeof @offerCurrency == 'undefined'
        throw new Error('Order must be associated with an offer currency')

      if typeof params.offerPrice == 'undefined'
        if typeof params.bidPrice == 'undefined'
            throw new Error('Must specify either bid amount and price or offer amount and price')
        else
          @bidPrice = params.bidPrice
          if @bidPrice.compareTo(Amount.ZERO) < 0
            throw new Error('bid price cannot be negative')
          else
            if typeof params.bidAmount == 'undefined'
              throw new Error('Must specify either bid amount and price or offer amount and price')
            else
              @bidAmount = params.bidAmount
              if @bidAmount.compareTo(Amount.ZERO) < 0
                throw new Error('bid amount cannot be negative')
              else
                if typeof params.offerAmount == 'undefined'
                  @offerAmount = @bidPrice.multiply(@bidAmount)
                  if typeof params.offerPrice != 'undefined'
                    throw new Error('Must specify either bid amount and price or offer amount and price')
                else
                  throw new Error('Must specify either bid amount and price or offer amount and price')
      else
        @offerPrice = params.offerPrice
        if @offerPrice.compareTo(Amount.ZERO) < 0
          throw new Error('offer price cannot be negative')
        else
          if typeof params.offerAmount == 'undefined'
            throw new Error('Must specify either bid amount and price or offer amount and price')
          else
            @offerAmount = params.offerAmount
            if @offerAmount.compareTo(Amount.ZERO) < 0
              throw new Error('offer amount cannot be negative')
            else
              if typeof params.bidAmount == 'undefined'
                @bidAmount = @offerAmount.multiply(@offerPrice)
                if typeof params.bidPrice != 'undefined'
                  throw new Error('Must specify either bid amount and price or offer amount and price')
              else
                throw new Error('Must specify either bid amount and price or offer amount and price')
    else
      @id = params.state.id
      @timestamp = params.state.timestamp
      @account = params.state.account
      @bidCurrency = params.state.bidCurrency
      @offerCurrency = params.state.offerCurrency
      if params.state.bidPrice
        @bidPrice = new Amount 
          state: params.state.bidPrice
      @bidAmount = new Amount
        state: params.state.bidAmount
      if params.state.offerPrice
        @offerPrice = new Amount
          state: params.state.offerPrice
      @offerAmount = new Amount
        state: params.state.offerAmount

  export: =>
    state = Object.create null
    state.id = @id
    state.timestamp = @timestamp
    state.account = @account
    state.bidCurrency = @bidCurrency
    state.offerCurrency = @offerCurrency
    if @bidPrice
      state.bidPrice = @bidPrice.export()
    state.bidAmount = @bidAmount.export()
    if @offerPrice
      state.offerPrice = @offerPrice.export()
    state.offerAmount = @offerAmount.export()
    return state

  equals: (order) =>
    if @id != order.id
      return false
    if @timestamp != order.timestamp
      return false
    if @account != order.account
      return false
    if @bidCurrency != order.bidCurrency
      return false
    if @offerCurrency != order.offerCurrency
      return false
    if @bidPrice
      if order.bidPrice
        if @bidPrice.compareTo(order.bidPrice) != 0
          return false
      else
        return false
    else
      if order.bidPrice
        return false
    if @bidAmount.compareTo(order.bidAmount) != 0
      return false
    if @offerPrice
      if order.offerPrice
        if @offerPrice.compareTo(order.offerPrice) != 0
          return false
      else
        return false
    else
      if order.offerPrice
        return false
    if @offerAmount.compareTo(order.offerAmount) != 0
      return false
    return true

  reduceOffer: (amount) =>
    if amount.compareTo(@offerAmount) > 0
      throw new Error('offer amount cannot be negative')
    else
      @offerAmount = @offerAmount.subtract(amount)
      @bidAmount = @offerAmount.multiply(@offerPrice)

  reduceBid: (amount) =>
    if amount.compareTo(@bidAmount) > 0
      throw new Error('bid amount cannot be negative')
    else
      @bidAmount = @bidAmount.subtract(amount)
      @offerAmount = @bidAmount.multiply(@bidPrice)

