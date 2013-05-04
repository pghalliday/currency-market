Amount = require './Amount'

module.exports = class Book
  constructor: ->

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
