Amount = require('../Amount')

module.exports = class Order
  constructor: (params) ->
    @sequence =  params.sequence
    if typeof @sequence == 'undefined'
      throw new Error('Order must have a sequence')

    @timestamp = params.timestamp
    if typeof @timestamp == 'undefined'
      throw new Error('Order must have a timestamp')

    @account = params.account
    if !@account
      throw new Error('Order must be associated with an account')

    @book = params.book
    if @book
      @bidBalance = @account.getBalance @book.bidCurrency
      @offerBalance = @account.getBalance @book.offerCurrency
    else
      throw new Error('Order must be associated with a book')

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
          else
            throw new Error('Must specify either bid amount and price or offer amount and price')
      else
          throw new Error('Must specify either bid amount and price or offer amount and price')

  partialOffer = (bidAmount, offerAmount, timestamp) ->
    @offerAmount = @offerAmount.subtract offerAmount
    @bidAmount = @offerAmount.multiply @offerPrice
    delta =
      remainder:
        bidAmount: @bidAmount.toString()
        offerAmount: @offerAmount.toString()
      transaction:
        credit: @bidBalance.applyBid
          amount: bidAmount
          timestamp: timestamp
        debit: @offerBalance.applyOffer
          amount: offerAmount
          fundsUnlocked: offerAmount

  partialBid = (bidAmount, offerAmount, timestamp) ->
    @bidAmount = @bidAmount.subtract bidAmount
    newOfferAmount = @bidAmount.multiply @bidPrice
    fundsUnlocked = @offerAmount.subtract newOfferAmount
    @offerAmount = newOfferAmount
    delta =
      remainder:
        bidAmount: @bidAmount.toString()
        offerAmount: @offerAmount.toString()
      transaction:
        credit: @bidBalance.applyBid
          amount: bidAmount
          timestamp: timestamp
        debit: @offerBalance.applyOffer
          amount: offerAmount
          fundsUnlocked: fundsUnlocked

  fill = (bidAmount, offerAmount, timestamp) ->
    fundsUnlocked = @offerAmount
    @bidAmount = Amount.ZERO
    @offerAmount = Amount.ZERO
    delta =
      transaction:
        credit: @bidBalance.applyBid
          amount: bidAmount
          timestamp: timestamp
        debit: @offerBalance.applyOffer
          amount: offerAmount
          fundsUnlocked: fundsUnlocked
    @account.complete @
    @book.cancel @
    return delta

  match: (order) =>
    trade = undefined
    if @offerPrice
      if order.bidPrice
        if order.bidPrice.compareTo(@offerPrice) >= 0
          # prices overlap so we make a trade
          price = order.bidPrice
          compareAmounts = @offerAmount.compareTo order.bidAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = partialOffer.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
          else
            leftOfferAmount = @offerAmount
            rightOfferAmount = leftOfferAmount.multiply price
            if compareAmounts == 0
              rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              rightDelta = partialBid.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
      else
        if order.offerPrice.multiply(@offerPrice).compareTo(Amount.ONE) <= 0
          # prices overlap so we make a trade
          price = order.offerPrice
          compareAmounts = @offerAmount.compareTo order.bidAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = partialOffer.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
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
              rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              rightDelta = partialOffer.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
    else
      if order.offerPrice
        if @bidPrice.compareTo(order.offerPrice) >= 0
          # prices overlap so we make a trade
          price = order.offerPrice
          compareAmounts = @bidAmount.compareTo order.offerAmount
          if compareAmounts > 0
            rightOfferAmount = order.offerAmount
            leftOfferAmount = rightOfferAmount.multiply price
            rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = partialBid.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
          else
            rightOfferAmount = @bidAmount
            leftOfferAmount = rightOfferAmount.multiply price
            if compareAmounts == 0
              rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              rightDelta = partialOffer.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
      else
        if order.bidPrice.multiply(@bidPrice).compareTo(Amount.ONE) >= 0
          # prices overlap so we make a trade
          price = order.bidPrice
          compareAmounts = @bidAmount.compareTo order.offerAmount
          if compareAmounts > 0
            leftOfferAmount = order.bidAmount
            rightOfferAmount = order.offerAmount
            rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = partialBid.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
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
              rightDelta = fill.call order, leftOfferAmount, rightOfferAmount, @timestamp
            else
              rightDelta = partialBid.call order, leftOfferAmount, rightOfferAmount, @timestamp
            leftDelta = fill.call @, rightOfferAmount, leftOfferAmount, @timestamp
            trade = 
              left: leftDelta
              right: rightDelta
    return trade

  add: (order, nextHigher) =>
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
        nextHigher = @higher.add order, nextHigher
      else
        @higher = order
        order.parent = @
    else
      if @lower
        nextHigher = @lower.add order, @
      else
        nextHigher = @
        @lower = order
        order.parent = @
    return nextHigher

  # private function only used by delete
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
    object.sequence = @sequence
    object.timestamp = @timestamp
    object.account = @account.id
    object.bidCurrency = @book.bidCurrency
    object.offerCurrency = @book.offerCurrency
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

