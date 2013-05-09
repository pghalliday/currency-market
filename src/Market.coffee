Book = require('./Book')
Account = require('./Account')
Amount = require('./Amount')
Order = require('./Order')
EventEmitter = require('events').EventEmitter

module.exports = class Market extends EventEmitter
  constructor: (params) ->
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
    leftOrder = leftBook.next()
    rightOrder = rightBook.next()
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
        @deposit
          id: '0'
          timestamp: '0'
          account: id
          currency: currency
          amount: new Amount balance.funds
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


