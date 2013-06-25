Book = require('./Book')
Account = require('./Account')
Amount = require('./Amount')
Order = require('./Order')
EventEmitter = require('events').EventEmitter

module.exports = class Engine extends EventEmitter
  constructor: (params) ->
    @nextOperationSequence = 0
    @nextDeltaSequence = 0
    @accounts = Object.create null
    @books = Object.create null
    if params
      if params.commission
        @commission = 
          account: @getAccount params.commission.account
          calculate: params.commission.calculate

  getAccount: (id) =>
    account = @accounts[id]
    if !account
      @accounts[id] = account = new Account
        id: id
        commission: @commission
    return account

  getBook: (bidCurrency, offerCurrency) =>
    books = @books[bidCurrency]
    if !books
      @books[bidCurrency] = books = Object.create null
    book = books[offerCurrency]
    if !book
      books[offerCurrency] = book = new Book()
    return book

  apply: (operation) =>
    if typeof operation.sequence != 'undefined'
      if operation.sequence == @nextOperationSequence
        @nextOperationSequence++
        if typeof operation.timestamp != 'undefined'
          account = @getAccount operation.account
          delta =
            sequence: @nextDeltaSequence
            operation: operation
          if operation.deposit
            account.deposit operation.deposit
            @nextDeltaSequence++
            @emit 'delta', delta
          else if operation.withdraw
            account.withdraw operation.withdraw
            @nextDeltaSequence++
            @emit 'delta', delta
          else if operation.submit
            submit = operation.submit
            order = new Order
              id: operation.sequence
              timestamp: operation.timestamp
              account: operation.account
              bidCurrency: submit.bidCurrency
              offerCurrency: submit.offerCurrency
              bidPrice: if submit.bidPrice then new Amount submit.bidPrice else undefined
              bidAmount: if submit.bidAmount then new Amount submit.bidAmount else undefined
              offerPrice: if submit.offerPrice then new Amount submit.offerPrice else undefined
              offerAmount: if submit.offerAmount then new Amount submit.offerAmount else undefined
            leftBook = @getBook order.bidCurrency, order.offerCurrency
            account.submit order
            leftBook.submit order
            # forward trade events from the order
            order.on 'trade', (trade) =>
              @emit 'trade', trade
            # emit an order added event
            @nextDeltaSequence++
            @emit 'delta', delta
            # check the books to see if any orders can be executed
            rightBook = @getBook order.offerCurrency, order.bidCurrency
            execute leftBook, rightBook
          else
            throw new Error 'Unknown operation'
        else
          throw new Error 'Must supply a timestamp'
      else
        throw new Error 'Unexpected sequence number'
    else
      throw new Error 'Must supply a sequence number'

  execute = (leftBook, rightBook) ->
    leftOrder = leftBook.next()
    rightOrder = rightBook.next()
    if leftOrder && rightOrder
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order
        tryAgain = leftOrder.match rightOrder
        if tryAgain
          execute leftBook, rightBook

  cancel: (cancellation) =>
    account = @getAccount cancellation.order.account
    order = account.getBalance(cancellation.order.offerCurrency).offers[cancellation.order.id]
    if order
      @getBook(order.bidCurrency, order.offerCurrency).cancel order
      account.cancel order
      @lastTransaction = cancellation.id
      @emit 'cancellation', cancellation
    else
      throw new Error 'Order cannot be found'

  export: =>
    object = Object.create null
    object.lastTransaction = @lastTransaction
    object.accounts = Object.create null
    for id, account of @accounts
      object.accounts[id] = account.export()
    object.books = Object.create null
    for bidCurrency, books of @books
      object.books[bidCurrency] = Object.create null
      for offerCurrency, book of books
        object.books[bidCurrency][offerCurrency] = book.export()
    return object

  import: (snapshot) =>
    for id, account of snapshot.accounts
      for currency, balance of account.balances
        @apply
          account: id
          sequence: @nextOperationSequence
          timestamp: 0
          deposit:
            currency: currency
            amount: balance.funds
    for bidCurrency, books of snapshot.books
      for offerCurrency, book of books
        for order in book
          do (order) =>
            if order.bidPrice
              @submit new Order
                id: order.id
                timestamp: order.timestamp
                account: order.account
                offerCurrency: order.offerCurrency
                bidCurrency: order.bidCurrency
                bidPrice: new Amount order.bidPrice
                bidAmount: new Amount order.bidAmount
            else
              @submit new Order
                id: order.id
                timestamp: order.timestamp
                account: order.account
                offerCurrency: order.offerCurrency
                bidCurrency: order.bidCurrency
                offerPrice: new Amount order.offerPrice
                offerAmount: new Amount order.offerAmount
    @lastTransaction = snapshot.lastTransaction


