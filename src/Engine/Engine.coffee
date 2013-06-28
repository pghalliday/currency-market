Book = require('./Book')
Account = require('./Account')
Amount = require('../Amount')
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
      books[offerCurrency] = book = new Book
        bidCurrency: bidCurrency
        offerCurrency: offerCurrency
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
            leftBook = @getBook submit.bidCurrency, submit.offerCurrency
            order = new Order
              sequence: operation.sequence
              timestamp: operation.timestamp
              account: account
              book: leftBook
              bidPrice: submit.bidPrice
              bidAmount: submit.bidAmount
              offerPrice: submit.offerPrice
              offerAmount: submit.offerAmount
            account.submit order
            nextHigher = leftBook.submit order
            if nextHigher
              delta.nextHigherOrderSequence = nextHigher.sequence
            else
              delta.nextHigherOrderSequence = -1
            # emit an order added event
            @nextDeltaSequence++
            @emit 'delta', delta
            # check the books to see if any orders can be executed
            rightBook = @getBook submit.offerCurrency, submit.bidCurrency
            @execute leftBook, rightBook
          else if operation.cancel
            order = account.cancel operation.cancel.sequence
            @getBook(order.bidBalance.currency, order.offerBalance.currency).cancel order
            @nextDeltaSequence++
            @emit 'delta', delta
          else
            throw new Error 'Unknown operation'
        else
          throw new Error 'Must supply a timestamp'
      else
        throw new Error 'Unexpected sequence number'
    else
      throw new Error 'Must supply a sequence number'

  # Private method used by apply
  execute: (leftBook, rightBook) =>
    leftOrder = leftBook.next()
    rightOrder = rightBook.next()
    if leftOrder && rightOrder
      # just added an order to the left book so the left order must be
      # the most recent addition if we get here. This means that we should
      # take the price from the right order
      result = leftOrder.match rightOrder
      if result.trade
        delta =
          sequence: @nextDeltaSequence
          trade: result.trade
        @nextDeltaSequence++
        @emit 'delta', delta
        if !result.complete
          @execute leftBook, rightBook

  export: =>
    object = Object.create null
    object.nextOperationSequence = @nextOperationSequence
    object.nextDeltaSequence = @nextDeltaSequence
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
            amount: new Amount balance.funds
    for bidCurrency, books of snapshot.books
      for offerCurrency, book of books
        for order in book
          do (order) =>
            account = @getAccount order.account
            book = @getBook order.bidCurrency, order.offerCurrency
            orderObject = new Order
              sequence: order.sequence
              timestamp: order.timestamp
              account: account
              book: book
              bidPrice: if order.bidPrice then new Amount order.bidPrice else undefined
              bidAmount: if order.bidAmount then new Amount order.bidAmount else undefined
              offerPrice: if order.offerPrice then new Amount order.offerPrice else undefined
              offerAmount: if order.offerAmount then new Amount order.offerAmount else undefined
            account.submit orderObject
            book.submit orderObject
    @nextOperationSequence = snapshot.nextOperationSequence
    @nextDeltaSequence = snapshot.nextDeltaSequence


