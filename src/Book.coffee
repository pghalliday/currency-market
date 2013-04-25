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
    order.parent = head
  else
    insertLowest(head.lower, order)

exportOrders = (head) ->
  state = Object.create null
  state.order = head.id
  if typeof head.higher != 'undefined'
    state.higher = exportOrders head.higher
  if typeof head.lower != 'undefined'
    state.lower = exportOrders head.lower
  return state

unexportOrders = (head, orders) ->
  order = orders[head.order]
  if typeof head.higher != 'undefined'
    order.higher = unexportOrders head.higher, orders
    order.higher.parent = order
  if typeof head.lower != 'undefined'
    order.lower = unexportOrders head.lower, orders
    order.lower.parent = order
  return order

parentEquals = (left, right) ->
  if typeof left.parent == 'undefined'
    if typeof right.parent == 'undefined'
      return true
    else
      return false
  else
    if typeof right.parent == 'undefined'
      return false
    else
      return left.parent.equals right.parent

lowerEquals = (left, right) ->
  if typeof left.lower == 'undefined'
    if typeof right.lower == 'undefined'
      return true
    else
      return false
  else
    if typeof right.lower == 'undefined'
      return false
    else
      return equals left.lower, right.lower

higherEquals = (left, right) ->
  if typeof left.higher == 'undefined'
    if typeof right.higher == 'undefined'
      return true
    else
      return false
  else
    if typeof right.higher == 'undefined'
      return false
    else
      return equals left.higher, right.higher

equals = (left, right) ->
  if parentEquals left, right
    if lowerEquals left, right
      if higherEquals left, right
        if left.equals right
          return true
        else
          return false
      else
        return false
    else
      return false
  else
    return false


module.exports = class Book
  constructor: (params) ->
    if typeof params != 'undefined'
      if typeof params.state.head != 'undefined'
        @head = unexportOrders params.state.head, params.orders
        @highest = findHighest @head

  export: =>
    state = Object.create null
    if typeof @head != 'undefined'
      state.head = exportOrders @head
    return state

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

  equals: (book) =>
    if typeof @highest == 'undefined'
      if typeof book.highest == 'undefined'
        if typeof @head == 'undefined'
          if typeof book.head == 'undefined'
            return true
          else
            return false
        else
          if typeof book.head == 'undefined'
            return false
          else
            return equals @head, book.head
      else
        return false
    else
      if typeof book.highest == 'undefined'
        return false
      else
        if @highest.equals book.highest
          if typeof @head == 'undefined'
            if typeof book.head == 'undefined'
              return true
            else
              return false
          else
            if typeof book.head == 'undefined'
              return false
            else
              return equals @head, book.head
        else
          return false

