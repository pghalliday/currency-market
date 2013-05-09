Amount = require('./Amount')
EventEmitter = require('events').EventEmitter

module.exports = class Order extends EventEmitter
  constructor: (params) ->
    @id =  params.id
    if !@id
      throw new Error('Order must have an ID')

    @timestamp = params.timestamp
    if !@timestamp
      throw new Error('Order must have a time stamp')

    @account = params.account
    if !@account
      throw new Error('Order must be associated with an account')

    @bidCurrency = params.bidCurrency
    if !@bidCurrency
      throw new Error('Order must be associated with a bid currency')

    @offerCurrency = params.offerCurrency
    if !@offerCurrency
      throw new Error('Order must be associated with an offer currency')

    if params.offerPrice
      @offerPrice = params.offerPrice
      if @offerPrice.compareTo(Amount.ZERO) < 0
        throw new Error('offer price cannot be negative')
      else
        if params.offerAmount
          @offerAmount = params.offerAmount
          if @offerAmount.compareTo(Amount.ZERO) < 0
            throw new Error('offer amount cannot be negative')
          else
            if params.bidAmount
              throw new Error('Must specify either bid amount and price or offer amount and price')
            else
              @bidAmount = @offerAmount.multiply(@offerPrice)
              if params.bidPrice
                throw new Error('Must specify either bid amount and price or offer amount and price')
        else
          throw new Error('Must specify either bid amount and price or offer amount and price')
    else
      if params.bidPrice
        @bidPrice = params.bidPrice
        if @bidPrice.compareTo(Amount.ZERO) < 0
          throw new Error('bid price cannot be negative')
        else
          if params.bidAmount
            @bidAmount = params.bidAmount
            if @bidAmount.compareTo(Amount.ZERO) < 0
              throw new Error('bid amount cannot be negative')
            else
              if params.offerAmount
                throw new Error('Must specify either bid amount and price or offer amount and price')
              else
                @offerAmount = @bidPrice.multiply(@bidAmount)
                if params.offerPrice
                  throw new Error('Must specify either bid amount and price or offer amount and price')
          else
            throw new Error('Must specify either bid amount and price or offer amount and price')
      else
          throw new Error('Must specify either bid amount and price or offer amount and price')

  partialOffer = (bidAmount, offerAmount, timestamp) ->
    @offerAmount = @offerAmount.subtract offerAmount
    @bidAmount = @offerAmount.multiply @offerPrice
    @emit 'fill', 
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: offerAmount
      timestamp: timestamp

  partialBid = (bidAmount, offerAmount, timestamp) ->
    @bidAmount = @bidAmount.subtract bidAmount
    newOfferAmount = @bidAmount.multiply @bidPrice
    fundsUnlocked = @offerAmount.subtract newOfferAmount
    @offerAmount = newOfferAmount
    @emit 'fill',
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: fundsUnlocked
      timestamp: timestamp

  fill = (bidAmount, offerAmount, timestamp) ->
    fundsUnlocked = @offerAmount
    @bidAmount = Amount.ZERO
    @offerAmount = Amount.ZERO
    @emit 'fill', 
      offerAmount: offerAmount
      bidAmount: bidAmount
      fundsUnlocked: fundsUnlocked
      timestamp: timestamp
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
            fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            partialOffer.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
              fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              partialBid.call order, leftOfferAmount, rightOfferAmount, @timestamp
            fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
            fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            partialOffer.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
              fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              partialOffer.call order, leftOfferAmount, rightOfferAmount, @timestamp
            fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
            fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            partialBid.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
              fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              partialOffer.call order, leftOfferAmount, rightOfferAmount, @timestamp
            fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
            fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            partialBid.call @, rightOfferAmount, leftOfferAmount, @timestamp
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
              fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              partialBid.call order, leftOfferAmount, rightOfferAmount, @timestamp
            fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
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

  export: =>
    object = Object.create null
    object.id = @id
    object.timestamp = @timestamp
    object.account = @account
    object.bidCurrency = @bidCurrency
    object.offerCurrency = @offerCurrency
    if @bidPrice
      object.bidPrice = @bidPrice.toString()
      object.bidAmount = @bidAmount.toString()
    else
      object.offerPrice = @offerPrice.toString()
      object.offerAmount = @offerAmount.toString()
    return object

  nextParent: =>
    if @parent
      if @parent.higher == @
        return @parent
      else
        return @parent.nextParent()

  next: =>
    if @lower
      return @lower.getHighest()
    else
      return @nextParent()

