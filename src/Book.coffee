Amount = require './Amount'
Order = require './Order'

module.exports = class Book
  constructor: (params) ->
    if params
      if params.state.head
        @head = new Order
          state: params.state.head
          orders: params.orders
        @highest = @head.getHighest()
        for id, order of params.orders
          order.on 'done', =>
            @cancel order

  export: =>
    state = Object.create null
    if @head
      state.head = @head.export()
    return state

  submit: (order) =>
    if @head
      if order.bidPrice
        isHighest = order.bidPrice.compareTo(@highest.bidPrice) > 0
      else
        isHighest = order.offerPrice.compareTo(@highest.offerPrice) < 0

      if isHighest
        @highest.add order
        @highest = order
      else
        @head.add order
    else
      @head = order
      @highest = order
    order.on 'done', =>
      @cancel order
  
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

  equals: (book) =>
    if @head
      if book.head
        if !@head.equals book.head
          return false
      else
        return false
    else
      if book.head
        return false
    if @highest
      if book.highest
        if !@highest.equals book.highest
          return false
      else
        return false
    else
      if book.highest
        return false
    return true
