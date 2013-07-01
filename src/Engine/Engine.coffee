Book = require('./Book')
Account = require('./Account')
Amount = require('../Amount')
Order = require('./Order')

module.exports = class Engine
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
            operation: operation
            result: Object.create null
          if operation.deposit
            deposit = operation.deposit
            delta.result.funds = account.deposit
              currency: deposit.currency
              amount: if deposit.amount then new Amount deposit.amount
          else if operation.withdraw
            withdraw = operation.withdraw
            delta.result.funds = account.withdraw
              currency: withdraw.currency
              amount: if withdraw.amount then new Amount withdraw.amount
          else if operation.submit
            submit = operation.submit
            leftBook = @getBook submit.bidCurrency, submit.offerCurrency
            order = new Order
              sequence: operation.sequence
              timestamp: operation.timestamp
              account: account
              book: leftBook
              bidPrice: if submit.bidPrice then new Amount submit.bidPrice
              bidAmount: if submit.bidAmount then new Amount submit.bidAmount
              offerPrice: if submit.offerPrice then new Amount submit.offerPrice
              offerAmount: if submit.offerAmount then new Amount submit.offerAmount
            delta.result.lockedFunds = account.submit order
            nextHigher = leftBook.submit order
            if nextHigher
              delta.result.nextHigherOrderSequence = nextHigher.sequence
            else
              # check the books to see if any orders can be executed
              delta.result.trades = []
              rightBook = @getBook submit.offerCurrency, submit.bidCurrency
              @execute delta.result.trades, leftBook, rightBook
          else if operation.cancel
            order = account.getOrder operation.cancel.sequence
            lockedFunds = account.cancel order
            @getBook(order.bidBalance.currency, order.offerBalance.currency).cancel order
          else
            throw new Error 'Unknown operation'
          delta.sequence = @nextDeltaSequence++
          return delta
        else
          throw new Error 'Must supply a timestamp'
      else
        throw new Error 'Unexpected sequence number'
    else
      throw new Error 'Must supply a sequence number'

  # Private method used by apply
  execute: (trades, leftBook, rightBook) =>
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if leftOrder && rightOrder
      # just added an order to the left book so the left order must be
      # the most recent addition if we get here. This means that we should
      # take the price from the right order
      trade = leftOrder.match rightOrder
      if trade
        trades.push trade
        if trade.left.remainder
          @execute trades, leftBook, rightBook

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
      accountObject = @getAccount id
      for currency, balance of account.balances
        accountObject.deposit
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
              bidPrice: if order.bidPrice then new Amount order.bidPrice
              bidAmount: if order.bidAmount then new Amount order.bidAmount
              offerPrice: if order.offerPrice then new Amount order.offerPrice
              offerAmount: if order.offerAmount then new Amount order.offerAmount
            account.submit orderObject
            book.submit orderObject
    @nextOperationSequence = snapshot.nextOperationSequence
    @nextDeltaSequence = snapshot.nextDeltaSequence


