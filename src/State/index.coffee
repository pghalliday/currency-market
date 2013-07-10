Account = require './Account'
Amount = require '../Amount'

convert = (order) ->
  order.bidPrice = if order.bidPrice then new Amount order.bidPrice
  order.bidAmount = if order.bidAmount then new Amount order.bidAmount
  order.offerPrice = if order.offerPrice then new Amount order.offerPrice
  order.offerAmount = if order.offerAmount then new Amount order.offerAmount

applyHalfTrade = (params) ->
  account = params.account
  commissionAccount = params.commissionAccount
  book = params.book
  order = params.order
  halfTrade = params.halfTrade
  remainder = halfTrade.remainder
  if remainder
    if order.bidAmount
      order.bidAmount = remainder.bidAmount
    else
      order.offerAmount = remainder.offerAmount
  else
    book.splice 0, 1
    delete account.orders[order.sequence]
  transaction = halfTrade.transaction
  debit = transaction.debit
  balance = account.getBalance order.offerCurrency
  balance.funds = debit.funds
  balance.lockedFunds = debit.lockedFunds
  credit = transaction.credit
  balance = account.getBalance order.bidCurrency
  balance.funds = credit.funds
  commission = credit.commission
  if commission
    balance = commissionAccount.getBalance order.bidCurrency
    balance.funds = commission.funds

module.exports = class State
  constructor: (params) ->
    @accounts = {}
    @books = {}
    @nextDeltaSequence = 0
    if params
      exported = params.exported
      json = params.json
      commission = params.commission
      if json
        exported = JSON.parse json
      if exported
        params = exported
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
      if commission
        @commissionAccount = @getAccount commission.account

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
      account = @getAccount operation.account
      deposit = operation.deposit
      withdraw = operation.withdraw
      submit = operation.submit
      cancel = operation.cancel
      if deposit
        account.getBalance(deposit.currency).funds = result.funds
      else if withdraw
        account.getBalance(withdraw.currency).funds = result.funds
      else if submit
        order =
          sequence: operation.sequence
          timestamp: operation.timestamp
          account: operation.account
          bidCurrency: submit.bidCurrency
          offerCurrency: submit.offerCurrency
          bidPrice: submit.bidPrice
          bidAmount: submit.bidAmount
          offerPrice: submit.offerPrice
          offerAmount: submit.offerAmount
        account.orders[order.sequence] = order
        account.getBalance(order.offerCurrency).lockedFunds = result.lockedFunds
        book = @getBook
          bidCurrency: order.bidCurrency
          offerCurrency: order.offerCurrency
        nextHigherOrderSequence = result.nextHigherOrderSequence
        if typeof nextHigherOrderSequence != 'undefined'
          for before, index in book
            if before.sequence == nextHigherOrderSequence
              book.splice index + 1, 0, order
              break
        else
          book.splice 0, 0, order
          trades = result.trades
          opposingBook = @getBook
            bidCurrency: order.offerCurrency
            offerCurrency: order.bidCurrency
          for trade in trades
            left = trade.left
            right = trade.right
            applyHalfTrade
              account: account
              commissionAccount: @commissionAccount
              book: book
              order: order
              halfTrade: trade.left
            matched = opposingBook[0]
            applyHalfTrade
              account: @getAccount matched.account
              commissionAccount: @commissionAccount
              book: opposingBook
              order: matched
              halfTrade: trade.right
      else if cancel
        order = account.orders[cancel.sequence]
        account.getBalance(order.offerCurrency).lockedFunds = result.lockedFunds
        delete account.orders[cancel.sequence]
        book = @getBook
          bidCurrency: order.bidCurrency
          offerCurrency: order.offerCurrency
        for match, index in book
          if match.sequence == cancel.sequence
            book.splice index, 1
            break
      else
        throw new Error 'Unknown operation'
    else if delta.sequence > @nextDeltaSequence
      throw new Error 'Unexpected delta'
