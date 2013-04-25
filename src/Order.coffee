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
          @fillOffer = false
          @bidPrice = new Amount(params.bidPrice)
          if @bidPrice.compareTo(Amount.ZERO) < 0
            throw new Error('bid price cannot be negative')
          else
            if typeof params.bidAmount == 'undefined'
              throw new Error('Must specify either bid amount and price or offer amount and price')
            else
              @bidAmount = new Amount(params.bidAmount)
              if @bidAmount.compareTo(Amount.ZERO) < 0
                throw new Error('bid amount cannot be negative')
              else
                if typeof params.offerAmount == 'undefined'
                  @offerAmount = @bidPrice.multiply(@bidAmount)
                  if typeof params.offerPrice == 'undefined'
                    @offerPrice = @bidAmount.divide(@offerAmount)
                  else
                    throw new Error('Must specify either bid amount and price or offer amount and price')
                else
                  throw new Error('Must specify either bid amount and price or offer amount and price')
      else
        @fillOffer = true
        @offerPrice = new Amount(params.offerPrice)
        if @offerPrice.compareTo(Amount.ZERO) < 0
          throw new Error('offer price cannot be negative')
        else
          if typeof params.offerAmount == 'undefined'
            throw new Error('Must specify either bid amount and price or offer amount and price')
          else
            @offerAmount = new Amount(params.offerAmount)
            if @offerAmount.compareTo(Amount.ZERO) < 0
              throw new Error('offer amount cannot be negative')
            else
              if typeof params.bidAmount == 'undefined'
                @bidAmount = @offerAmount.multiply(@offerPrice)
                if typeof params.bidPrice == 'undefined'
                  @bidPrice = @offerAmount.divide(@bidAmount)
                else
                  throw new Error('Must specify either bid amount and price or offer amount and price')
              else
                throw new Error('Must specify either bid amount and price or offer amount and price')
    else
      @id = params.state.id
      @timestamp = params.state.timestamp
      @account = params.state.account
      @bidCurrency = params.state.bidCurrency
      @offerCurrency = params.state.offerCurrency
      @bidPrice = new Amount params.state.bidPrice
      @bidAmount = new Amount params.state.bidAmount
      @offerPrice = new Amount params.state.offerPrice
      @offerAmount = new Amount params.state.offerAmount
      @fillOffer = params.state.fillOffer

  export: =>
    state = Object.create null
    state.id = @id
    state.timestamp = @timestamp
    state.account = @account
    state.bidCurrency = @bidCurrency
    state.offerCurrency = @offerCurrency
    state.bidPrice = @bidPrice.toString()
    state.bidAmount = @bidAmount.toString()
    state.offerPrice = @offerPrice.toString()
    state.offerAmount = @offerAmount.toString()
    state.fillOffer = @fillOffer
    return state

  equals: (order) =>
    @id == order.id &&
    @timestamp == order.timestamp && 
    @account == order.account &&
    @bidCurrency == order.bidCurrency &&
    @offerCurrency == order.offerCurrency &&
    @bidPrice.compareTo(order.bidPrice) == 0 &&
    @bidAmount.compareTo(order.bidAmount) == 0 &&
    @offerPrice.compareTo(order.offerPrice) == 0 &&
    @offerAmount.compareTo(order.offerAmount) == 0 &&
    @fillOffer == order.fillOffer

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




