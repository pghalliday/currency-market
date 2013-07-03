Book = require './Book'
Account = require './Account'
Amount = require '../Amount'
Order = require './Order'
Delta = require '../Delta'
DepositResult = require '../Delta/DepositResult'
WithdrawResult = require '../Delta/WithdrawResult'
CancelResult = require '../Delta/CancelResult'
CancelResult = require '../Delta/SubmitResult'

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
      if params.state
        state = params.state
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
    if typeof operation.sequence != 'undefined'
      if operation.sequence == @nextOperationSequence
        @nextOperationSequence++
        if typeof operation.timestamp != 'undefined'
          account = @getAccount operation.account
          if operation.deposit
            deposit = operation.deposit
            delta = new Delta
              sequence: @nextDeltaSequence
              operation: operation
              result: new DepositResult
                funds: account.deposit
                  currency: deposit.currency
                  amount: if deposit.amount then new Amount deposit.amount
          else if operation.withdraw
            withdraw = operation.withdraw
            delta = new Delta
              sequence: @nextDeltaSequence
              operation: operation
              result: new WithdrawResult
                funds: account.withdraw
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
              result: new CancelResult
                lockedFunds: account.cancel order
            @getBook(order.bidBalance.currency, order.offerBalance.currency).cancel order
          else
            throw new Error 'Unknown operation'
          @nextDeltaSequence++
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
    return trades

  toJSON: =>
    object =
      nextOperationSequence: @nextOperationSequence
      nextDeltaSequence: @nextDeltaSequence
      accounts: @accounts
      books: @books


