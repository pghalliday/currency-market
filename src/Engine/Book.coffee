Amount = require '../Amount'

module.exports = class Book
  constructor: (params) ->
    @bidCurrency = params.bidCurrency
    if @bidCurrency
      @offerCurrency = params.offerCurrency
      if !@offerCurrency
        throw new Error 'Must supply an offer currency'
    else
      throw new Error 'Must supply a bid currency'

  submit: (order) =>
    nextHigher = undefined
    if @head
      if @highest.bidPrice
        if order.bidPrice
          isHighest = order.bidPrice.compareTo(@highest.bidPrice) > 0
        else
          isHighest = order.offerPrice.multiply(@highest.bidPrice).compareTo(Amount.ONE) < 0
      else
        if order.offerPrice
          isHighest = order.offerPrice.compareTo(@highest.offerPrice) < 0
        else
          isHighest = order.bidPrice.multiply(@highest.offerPrice).compareTo(Amount.ONE) > 0

      if isHighest
        @highest.add order
        @highest = order
      else
        nextHigher = @head.add order
    else
      @head = order
      @highest = order
    order.on 'done', =>
      @cancel order
    return nextHigher
  
  cancel: (order) =>
    parent = order.parent
    newHead = order.delete()

    if @highest == order
      if newHead
        @highest = newHead.getHighest()
      else
        if parent
          @highest = parent
        else
          delete @highest

    if order == @head
      if newHead
        @head = newHead
      else
        delete @head

  next: =>
    @highest

  export: =>
    next = @
    while next = next.next()
      next.export()
