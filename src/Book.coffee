BookEntry = require './BookEntry'

module.exports = class Book
  constructor: (params) ->
    @entries = Object.create null
    if typeof params != 'undefined'
      if typeof params.state.head != 'undefined'
        @head = new BookEntry
          state: params.state.head
          entries: @entries
        @highest = @head.getHighest().order

  export: =>
    state = Object.create null
    if typeof @head != 'undefined'
      state.head = @head.export()
    return state

  add: (order) =>
    entry = new BookEntry
      order: order
    @entries[order.id] = entry
    if @head
      if order.bidPrice
        isHighest = order.bidPrice.compareTo(@highest.bidPrice) > 0
      else
        isHighest = order.offerPrice.compareTo(@highest.offerPrice) < 0

      if isHighest
        highestEntry = @entries[@highest.id]
        highestEntry.add entry
        @highest = order
      else
        @head.add entry
    else
      @head = entry
      @highest = order
  
  delete: (order) =>
    entry = @entries[order.id]
    if !entry
      throw new Error('Order cannot be found')
    else
      if entry.order.equals order
        delete @entries[order.id]
        parent = entry.parent
        newHead = entry.delete()

        if @highest == entry.order
          if newHead
            @highest = newHead.getHighest().order
          else
            if parent
              @highest = parent.order
            else
              delete @highest

        if entry == @head
          if newHead
            @head = newHead
          else
            delete @head
      else
        throw new Error('Order does not match')

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
