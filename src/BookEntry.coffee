Order = require './Order'
Amount = require './Amount'

module.exports = class BookEntry
  constructor: (params) ->
    if params.state
      @order = new Order
        state: params.state.order
      params.entries[@order.id] = @
      if params.state.lower
        @lower = new BookEntry
          state: params.state.lower
          entries: params.entries
        @lower.parent = @
      if params.state.higher
        @higher = new BookEntry
          state: params.state.higher
          entries: params.entries
        @higher.parent = @
    else
      if params.order
        @order = params.order
      else
        throw new Error('Must supply an order')

  export: =>
    state = Object.create null
    state.order = @order.export()
    if @lower
      state.lower = @lower.export()
    if @higher
      state.higher = @higher.export()
    return state

  add: (bookEntry) =>
    if @order.bidPrice
      if bookEntry.order.bidPrice
        isHigher = bookEntry.order.bidPrice.compareTo(@order.bidPrice) > 0
      else
        isHigher = bookEntry.order.offerPrice.multiply(@order.bidPrice).compareTo(Amount.ONE) < 0
    else
      if bookEntry.order.offerPrice
        isHigher = bookEntry.order.offerPrice.compareTo(@order.offerPrice) < 0
      else
        isHigher = bookEntry.order.bidPrice.multiply(@order.offerPrice).compareTo(Amount.ONE) > 0

    if isHigher
      if @higher
        @higher.add bookEntry
      else
        @higher = bookEntry
        bookEntry.parent = @
    else
      if @lower
        @lower.add bookEntry
      else
        @lower = bookEntry
        bookEntry.parent = @

  addLowest: (bookEntry) =>
    if @lower
      @lower.addLowest bookEntry
    else
      @lower = bookEntry
      bookEntry.parent = @

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

  equals: (bookEntry) =>
    if @order.equals bookEntry.order
      if @higher
        if bookEntry.higher
          if !@higher.equals bookEntry.higher
            return false
        else
          return false
      else if bookEntry.higher
        return false
      if @lower
        if bookEntry.lower
          if !@lower.equals bookEntry.lower
            return false
        else
          return false
      else if bookEntry.lower
        return false
    else
      return false
    return true