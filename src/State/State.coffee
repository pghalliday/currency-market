Account = require './Account'

module.exports = class State
  constructor: (state) ->
    @accounts = {}
    @books = {}
    @nextSequence = 0
    if state
      @nextSequence = state.nextDeltaSequence
      for id, account of state.accounts
        @accounts[id] = new Account account
      for bidCurrency, books of state.books
        booksWithBidCurrency = @getBooks bidCurrency
        for offerCurrency, book of books
          booksWithBidCurrency[offerCurrency] = book
          for order in book
            do (order) =>
              @accounts[order.account].orders[order.sequence] = order
              
  getAccount: (id) =>
    @accounts[id] = @accounts[id] || new Account()

  getBooks: (bidCurrency) =>
    @books[bidCurrency] = @books[bidCurrency] || {}

  getBook: (params) =>
    bidCurrency = params.bidCurrency
    if bidCurrency
      books = @getBooks bidCurrency
      offerCurrency = params.offerCurrency
      if offerCurrency
        books[offerCurrency] = books[offerCurrency] || []
      else
        throw new Error 'Must supply an offer currency'
    else
      throw new Error 'Must supply a bid currency'

  apply: (delta) =>
    if delta.sequence == @nextSequence
      @nextSequence++
      operation = delta.operation
      result = delta.result
      account = @getAccount(operation.account)
      deposit = operation.deposit
      if deposit
        account.getBalance(deposit.currency).funds = result.funds
      else
        throw new Error 'Unknown operation'
    else if delta.sequence > @nextSequence
      throw new Error 'Unexpected delta'
