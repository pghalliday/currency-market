insert = (head, order) ->
  if order.bidPrice.compareTo(head.bidPrice) > 0
    if typeof head.higher == 'undefined'
      head.higher = order
      order.parent = head
    else
      insert(head.higher, order)
  else
    if typeof head.lower == 'undefined'
      head.lower = order
      order.parent = head
    else
      insert(head.lower, order)

findHighest = (order) ->
  if typeof order.higher == 'undefined'
    return order
  else
    return findHighest(order.higher)

insertLowest = (head, order) ->
  if typeof head.lower == 'undefined'
    head.lower = order
  else
    insertLowest(head.lower, order)

module.exports = class Book
  constructor: ->

  add: (order) =>
    if typeof @head == 'undefined'
      @head = order
      @highest = order
    else
      if order.bidPrice.compareTo(@highest.bidPrice) > 0
        @highest.higher = order
        order.parent = @highest
        @highest = order
      else
        insert(@head, order)
  
  delete: (order) =>
    parent = order.parent
    # reset the tree
    if typeof parent == 'undefined'
      if typeof order.higher == 'undefined'
        if typeof order.lower == 'undefined'
          delete @head
          delete @highest
        else
          @head = order.lower
          delete @head.parent
          @highest = findHighest(@head)
      else
        @head = order.higher
        delete @head.parent
        if typeof order.lower != 'undefined'
          insertLowest(@head, order.lower)            
    else
      if parent.lower == order
        if typeof order.higher == 'undefined'
          if typeof order.lower == 'undefined'
            delete parent.lower
          else
            parent.lower = order.lower
            parent.lower.parent = parent
        else
          parent.lower = order.higher
          parent.lower.parent = parent
          if typeof order.lower != 'undefined'
            insertLowest(parent.lower, order.lower)
      else if parent.higher == order
        if typeof order.higher == 'undefined'
          if typeof order.lower == 'undefined'
            delete parent.higher
            if @highest == order
              @highest = parent
          else
            parent.higher = order.lower
            parent.higher.parent = parent
            if @highest == order
              @highest = findHighest(order.lower)
        else
          parent.higher = order.higher
          parent.higher.parent = parent
          if typeof order.lower != 'undefined'
            insertLowest(parent.higher, order.lower)
      else
        throw new Error('Binary tree seems to be broken!')
