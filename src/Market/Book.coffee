insertOrder = (head, order) ->
  if order.bidPrice.compareTo(head.bidPrice) > 0
    if typeof head.higher == 'undefined'
      head.higher = order
      order.parent = head
    else
      insertOrder(head.higher, order)
  else
    if typeof head.lower == 'undefined'
      head.lower = order
      order.parent = head
    else
      insertOrder(head.lower, order)

getHighest = (order) ->
  if typeof order.higher == 'undefined'
    return getHighest(order.higher)
  else
    return order

module.exports = class Book
  constructor: ->
    @orders = Object.create null

  addOrder: (order) =>
    @orders[order.id] = order
    if typeof @head == 'undefined'
      @head = order
      @highest = order
    else
      insertOrder(@head, order)
      if order.bidPrice.compareTo(@highest.bidPrice) > 0
        @highest = order

  deleteOrder: (order) =>
    if typeof @orders[order.id] == 'undefined'
      throw new Error('Order cannot be found')
    else
      if order.equals(@orders[order.id])
        order = @orders[order.id]
        delete @orders[order.id]
        parent = order.parent

        # reset the tree
        if typeof parent == 'undefined'
          if typeof order.higher == 'undefined'
            if typeof order.lower == 'undefined'
              delete @head
            else
              @head = order.lower
          else
            @head = order.higher
            if typeof order.lower != 'undefined'
              insertOrder(@head, order.lower)            
        else
          if parent.lower == order
            if typeof order.higher == 'undefined'
              if typeof order.lower == 'undefined'
                delete parent.lower
              else
                parent.lower = order.lower
            else
              parent.lower = order.higher
              if typeof order.lower != 'undefined'
                insertOrder(parent.lower, order.lower)
          else if parent.higher == order
            if typeof order.higher == 'undefined'
              if typeof order.lower == 'undefined'
                delete parent.higher
              else
                parent.higher = order.lower
            else
              parent.higher = order.higher
              if typeof order.lower != 'undefined'
                insertOrder(parent.higher, order.lower)
          else
            throw new Error('Binary tree seems to be broken!')

        # reset the highest if necessary
        if @highest == order
          if typeof parent == 'undefined'
            if typeof @head == 'undefined'
              delete @highest
            else
              @highest = getHighest(@head)
          else
            @highest = parent
      else
        throw new Error('Orders do not match')
