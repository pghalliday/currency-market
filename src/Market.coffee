Book = require('./Book')
Account = require('./Account')
EventEmitter = require('events').EventEmitter

module.exports = class Market extends EventEmitter
  constructor: ->
    @accounts = Object.create null
    @books = Object.create null

  getAccount: (id) =>
    account = @accounts[id]
    if !account
      @accounts[id] = account = new Account id
    return account

  getBook: (bidCurrency, offerCurrency) =>
    books = @books[bidCurrency]
    if !books
      @books[bidCurrency] = books = Object.create null
    book = books[offerCurrency]
    if !book
      books[offerCurrency] = book = new Book()
    return book

  deposit: (deposit) =>
    if deposit.id
      if deposit.timestamp
        account = @getAccount(deposit.account)
        account.deposit deposit
        @lastTransaction = deposit.id
        @emit 'deposit', deposit
      else
        throw new Error 'Must supply timestamp'
    else
      throw new Error 'Must supply transaction ID'

  withdraw: (withdrawal) =>
    if withdrawal.id
      if withdrawal.timestamp
        account = @getAccount(withdrawal.account)
        account.withdraw withdrawal
        @lastTransaction = withdrawal.id
        @emit 'withdrawal', withdrawal
      else
        throw new Error 'Must supply timestamp'
    else
      throw new Error 'Must supply transaction ID'

  execute = (leftBook, rightBook) ->
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if leftOrder && rightOrder
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order
        tryAgain = leftOrder.match rightOrder
        if tryAgain
          execute leftBook, rightBook

  submit: (order) =>
    account = @getAccount(order.account)
    book = @getBook(order.bidCurrency, order.offerCurrency)
    account.submit order
    book.submit order
    @lastTransaction = order.id
    # forward trade events from the order
    order.on 'trade', (trade) =>
      @emit 'trade', trade
    # emit an order added event
    @emit 'order', order
    # check the books to see if any orders can be executed
    execute book, @getBook(order.offerCurrency, order.bidCurrency)

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
