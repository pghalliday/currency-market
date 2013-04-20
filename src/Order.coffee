Amount = require('../src/Amount')

module.exports = class Order
  constructor: (params) ->
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
        if typeof params.offerAmount == 'undefined'
          throw new Error('Insufficient information to calculate the order')
        else
          @offerAmount = new Amount(params.offerAmount)
          if typeof params.bidAmount == 'undefined'
            throw new Error('Insufficient information to calculate the order')
          else
            @bidAmount = new Amount(params.bidAmount)
            if typeof params.bidPrice == 'undefined'
              @bidPrice = @offerAmount.divide(@bidAmount)
              if typeof params.offerPrice == 'undefined'
                @offerPrice = @bidAmount.divide(@offerAmount)
              else
                throw new Error('Cannot specify a price if the offer and bid amounts are also specified')
            else
              throw new Error('Cannot specify a price if the offer and bid amounts are also specified')
      else
        @bidPrice = new Amount(params.bidPrice)
        if typeof params.offerAmount == 'undefined'
          if typeof params.bidAmount == 'undefined'
            throw new Error('Insufficient information to calculate the order')
          else
            @bidAmount = new Amount(params.bidAmount)
            if typeof params.offerAmount == 'undefined'
              @offerAmount = @bidPrice.multiply(@bidAmount)
              if typeof params.offerPrice == 'undefined'
                @offerPrice = @bidAmount.divide(@offerAmount)
              else
                throw new Error('Can only specify one of offer price and bid price')
            else
              throw new Error('Cannot specify a price if the offer and bid amounts are also specified')
        else
          @offerAmount = new Amount(params.offerAmount)
          if typeof params.bidAmount == 'undefined'
            @bidAmount = @offerAmount.divide(@bidPrice)
            if typeof params.offerPrice == 'undefined'
              @offerPrice = @bidAmount.divide(@offerAmount)
            else
              throw new Error('Can only specify one of offer price and bid price')
          else
              throw new Error('Cannot specify a price if the offer and bid amounts are also specified')
    else
      @offerPrice = new Amount(params.offerPrice)
      if typeof params.bidAmount == 'undefined'
        if typeof params.offerAmount == 'undefined'
          throw new Error('Insufficient information to calculate the order')
        else
          @offerAmount = new Amount(params.offerAmount)
          if typeof params.bidAmount == 'undefined'
            @bidAmount = @offerAmount.multiply(@offerPrice)
            if typeof params.bidPrice == 'undefined'
              @bidPrice = @offerAmount.divide(@bidAmount)
            else
              throw new Error('Can only specify one of offer price and bid price')
          else
              throw new Error('Cannot specify a price if the offer and bid amounts are also specified')
      else
        @bidAmount = new Amount(params.bidAmount)
        if typeof params.offerAmount == 'undefined'
          @offerAmount = @bidAmount.divide(@offerPrice)
          if typeof params.bidPrice == 'undefined'
            @bidPrice = @offerAmount.divide(@bidAmount)
          else
            throw new Error('Can only specify one of offer price and bid price')
        else
          throw new Error('Cannot specify a price if the offer and bid amounts are also specified')




