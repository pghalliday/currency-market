Amount = require('./Amount')
EventEmitter = require('events').EventEmitter

module.exports = class Order extends EventEmitter
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
      if params.state.lower
        @lower = new Order
          state: params.state.lower
          orders: params.orders
        @lower.parent = @
      if params.state.higher
        @higher = new Order
          state: params.state.higher
          orders: params.orders
        @higher.parent = @
      params.orders[@id] = @

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
    if @lower
      state.lower = @lower.export()
    if @higher
      state.higher = @higher.export()
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
    if @higher
      if order.higher
        if !@higher.equals order.higher
          return false
      else
        return false
    else if order.higher
      return false
    if @lower
      if order.lower
        if !@lower.equals order.lower
          return false
      else
        return false
    else if order.lower
      return false
    return true

  partialOffer = (bidAmount, offerAmount) ->
    @offerAmount = @offerAmount.subtract offerAmount
    @bidAmount = @offerAmount.multiply @offerPrice
    @emit 'fill', 
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: offerAmount

  partialBid = (bidAmount, offerAmount) ->
    @bidAmount = @bidAmount.subtract bidAmount
    newOfferAmount = @bidAmount.multiply @bidPrice
    fundsUnlocked = @offerAmount.subtract newOfferAmount
    @offerAmount = newOfferAmount
    @emit 'fill',
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: fundsUnlocked

  fill = (bidAmount, offerAmount) ->
    fundsUnlocked = @offerAmount
    @bidAmount = Amount.ZERO
    @offerAmount = Amount.ZERO
    @emit 'fill', 
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: fundsUnlocked
    @emit 'done'

  match: (order) =>
    if @offerPrice
      if order.bidPrice
        if order.bidPrice.compareTo(@offerPrice) >= 0
          # prices overlap so we make a trade
          price = order.bidPrice
          compareAmounts = @offerAmount.compareTo order.bidAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            fill.call order, leftOfferAmount, rightOfferAmount
            partialOffer.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: order
              offer: @
              price: price
              amount: leftOfferAmount
            return true
          else
            leftOfferAmount = @offerAmount
            rightOfferAmount = leftOfferAmount.multiply price
            if compareAmounts == 0
              fill.call order, leftOfferAmount, rightOfferAmount
            else
              partialBid.call order, leftOfferAmount, rightOfferAmount
            fill.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: order
              offer: @
              price: price
              amount: leftOfferAmount
            return false
      else
        if order.offerPrice.multiply(@offerPrice).compareTo(Amount.ONE) <= 0
          # prices overlap so we make a trade
          price = order.offerPrice
          compareAmounts = @offerAmount.compareTo order.bidAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            fill.call order, leftOfferAmount, rightOfferAmount
            partialOffer.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: @
              offer: order
              price: price
              amount: rightOfferAmount
            return true
          else
            leftOfferAmount = @offerAmount
            # NB: Cannot think of any way to avoid this divide but
            # must ensure that we round down as rounding up could
            # result in more funds being unlocked or withdrawn than
            # are available.
            # The good news is that this is a corner case and only happens
            # if you allow your market to be priced in either direction
            rightOfferAmount = leftOfferAmount.divide price
            if compareAmounts == 0
              fill.call order, leftOfferAmount, rightOfferAmount
            else
              partialOffer.call order, leftOfferAmount, rightOfferAmount
            fill.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: @
              offer: order
              price: price
              amount: rightOfferAmount
            return false
    else
      if order.offerPrice
        if @bidPrice.compareTo(order.offerPrice) >= 0
          # prices overlap so we make a trade
          price = order.offerPrice
          compareAmounts = @bidAmount.compareTo order.offerAmount
          if compareAmounts > 0
            rightOfferAmount = order.offerAmount
            leftOfferAmount = rightOfferAmount.multiply price
            fill.call order, leftOfferAmount, rightOfferAmount
            partialBid.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: @
              offer: order
              price: price
              amount: rightOfferAmount
            return true
          else
            rightOfferAmount = @bidAmount
            leftOfferAmount = rightOfferAmount.multiply price
            if compareAmounts == 0
              fill.call order, leftOfferAmount, rightOfferAmount
            else
              partialOffer.call order, leftOfferAmount, rightOfferAmount
            fill.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: @
              offer: order
              price: price
              amount: rightOfferAmount
            return false
      else
        if order.bidPrice.multiply(@bidPrice).compareTo(Amount.ONE) >= 0
          # prices overlap so we make a trade
          price = order.bidPrice
          compareAmounts = @bidAmount.compareTo order.offerAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            fill.call order, leftOfferAmount, rightOfferAmount
            partialBid.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: order
              offer: @
              price: price
              amount: leftOfferAmount
            return true
          else
            # NB: Cannot think of any way to avoid this divide but
            # must ensure that we round down as rounding up could
            # result in more funds being unlocked or withdrawn than
            # are available.
            # The good news is that this is a corner case and only happens
            # if you allow your market to be priced in either direction
            leftOfferAmount = @bidAmount.divide price
            # need to use the rounded value here otherwise the remainders from unlocking
            # and reducing the bid won't add up (this doesn't apply in the above 
            # division as there is no remainder)
            rightOfferAmount = leftOfferAmount.multiply price
            if compareAmounts == 0
              fill.call order, leftOfferAmount, rightOfferAmount
            else
              partialBid.call order, leftOfferAmount, rightOfferAmount
            fill.call @, rightOfferAmount, leftOfferAmount
            order.emit 'trade',
              bid: order
              offer: @
              price: price
              amount: leftOfferAmount
            return false

  add: (order) =>
    if @bidPrice
      if order.bidPrice
        isHigher = order.bidPrice.compareTo(@bidPrice) > 0
      else
        isHigher = order.offerPrice.multiply(@bidPrice).compareTo(Amount.ONE) < 0
    else
      if order.offerPrice
        isHigher = order.offerPrice.compareTo(@offerPrice) < 0
      else
        isHigher = order.bidPrice.multiply(@offerPrice).compareTo(Amount.ONE) > 0

    if isHigher
      if @higher
        @higher.add order
      else
        @higher = order
        order.parent = @
    else
      if @lower
        @lower.add order
      else
        @lower = order
        order.parent = @

  addLowest: (order) =>
    if @lower
      @lower.addLowest order
    else
      @lower = order
      order.parent = @

  delete: =>
    if @parent
      if @parent.lower == @
        if @higher
          @parent.lower = @higher
          @higher.parent = @parent
          newHead = @higher
          if @lower
            @higher.addLowest @lower
        else if @lower
          @parent.lower = @lower
          @lower.parent = @parent
          newHead = @lower
        else
          delete @parent.lower
      else
        if @higher
          @parent.higher = @higher
          @higher.parent = @parent
          newHead = @higher
          if @lower
            @higher.addLowest @lower
        else if @lower
          @parent.higher = @lower
          @lower.parent = @parent
          newHead = @lower
        else
          delete @parent.higher
    else
      if @higher
        delete @higher.parent
        newHead = @higher
        if @lower
          @higher.addLowest @lower
      else if @lower
        delete @lower.parent
        newHead = @lower
      else
        # do nothing, this is an orphan and will be garbage collected
    return newHead

  getHighest: =>
    if @higher
      return @higher.getHighest()
    else
      return @
