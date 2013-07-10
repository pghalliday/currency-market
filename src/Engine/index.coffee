Book = require './Book'
Account = require './Account'
Amount = require '../Amount'
Order = require './Order'
Delta = require '../Delta'

module.exports = class Engine
  constructor: (params) ->
    @nextOperationSequence = 0
    @nextDeltaSequence = 0
    @accounts = {}
    @books = {}
    if params
      if params.commission
        @commission = 
          account: @getAccount params.commission.account
          calculate: params.commission.calculate
      exported = params.exported
      if params.json
        exported = JSON.parse params.json
      if exported
        state = exported
        for id, account of state.accounts
          accountObject = @getAccount id
          for currency, balance of account.balances
            accountObject.deposit
              currency: currency
              amount: new Amount balance.funds
        for bidCurrency, books of state.books
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
        @nextOperationSequence = state.nextOperationSequence
        @nextDeltaSequence = state.nextDeltaSequence

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
      @books[bidCurrency] = books = {}
    book = books[offerCurrency]
    if !book
      books[offerCurrency] = book = new Book
        bidCurrency: bidCurrency
        offerCurrency: offerCurrency
    return book

  apply: (operation) =>
    sequence = operation.sequence
    if typeof sequence == 'undefined'
      throw new Error 'Operation must have been accepted'
    else
      timestamp = operation.timestamp
      if typeof timestamp == 'undefined'
        throw new Error 'Operation must have been accepted'
      else
        if sequence == @nextOperationSequence
          @nextOperationSequence++
          account = @getAccount operation.account
          if operation.deposit
            deposit = operation.deposit
            delta = new Delta
              sequence: @nextDeltaSequence
              operation: operation
              result:
                funds: account.deposit deposit
          else if operation.withdraw
            withdraw = operation.withdraw
            delta = new Delta
              sequence: @nextDeltaSequence
              operation: operation
              result:
                funds: account.withdraw withdraw
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
            lockedFunds = account.submit order
            nextHigher = leftBook.submit order
            if nextHigher
              delta = new Delta
                sequence: @nextDeltaSequence
                operation: operation
                result: 
                  lockedFunds: lockedFunds
                  nextHigherOrderSequence: nextHigher.sequence
            else
              # check the books to see if any orders can be executed
              rightBook = @getBook submit.offerCurrency, submit.bidCurrency
              delta = new Delta
                sequence: @nextDeltaSequence
                operation: operation
                result: 
                  lockedFunds: lockedFunds
                  trades: @execute [], leftBook, rightBook
          else if operation.cancel
            order = account.getOrder operation.cancel.sequence
            delta = new Delta
              sequence: @nextDeltaSequence
              operation: operation
              result:
                lockedFunds: account.cancel order
            @getBook(order.bidBalance.currency, order.offerBalance.currency).cancel order
          @nextDeltaSequence++
          return delta
        else
          throw new Error 'Unexpected sequence number'

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
    return trades

  toJSON: =>
    object =
      nextOperationSequence: @nextOperationSequence
      nextDeltaSequence: @nextDeltaSequence
      accounts: @accounts
      books: @books


