Account = require './Account'
Amount = require '../Amount'

convert = (order) ->
  order.bidPrice = if order.bidPrice then new Amount order.bidPrice
  order.bidAmount = if order.bidAmount then new Amount order.bidAmount
  order.offerPrice = if order.offerPrice then new Amount order.offerPrice
  order.offerAmount = if order.offerAmount then new Amount order.offerAmount

module.exports = class State
  constructor: (params) ->
    @accounts = {}
    @books = {}
    @nextDeltaSequence = 0
    if params
      json = params.json
      if json
        params = JSON.parse json
      @nextDeltaSequence = params.nextDeltaSequence
      for id, account of params.accounts
        @accounts[id] = new Account account
      for bidCurrency, books of params.books
        booksWithBidCurrency = @getBooks bidCurrency
        for offerCurrency, book of books
          booksWithBidCurrency[offerCurrency] = book
          for order in book
            convert order
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
    if delta.sequence == @nextDeltaSequence
      @nextDeltaSequence++
      operation = delta.operation
      result = delta.result
      account = @getAccount(operation.account)
      deposit = operation.deposit
      withdraw = operation.withdraw
      if deposit
        account.getBalance(deposit.currency).funds = result.funds
      else if withdraw
        account.getBalance(withdraw.currency).funds = result.funds
      else
        throw new Error 'Unknown operation'
    else if delta.sequence > @nextDeltaSequence
      throw new Error 'Unexpected delta'
