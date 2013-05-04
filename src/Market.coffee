Book = require('./Book')
EventEmitter = require('events').EventEmitter

module.exports = class Market extends EventEmitter
  constructor: (params) ->
    @accounts = Object.create null
    @books = Object.create null
    @currencies = params.currencies
    @currencies.forEach (offerCurrency) =>
      @books[offerCurrency] = Object.create null
      @currencies.forEach (bidCurrency) =>
        if bidCurrency != offerCurrency
          @books[offerCurrency][bidCurrency] = new Book()

  register: (account) =>
    if @accounts[account.id]
      throw new Error('Account already exists')
    else
      @accounts[account.id] = account
      @lastTransaction = account.id
      @emit 'account', account

  deposit: (deposit) =>
    if deposit.id
      if deposit.timestamp
        account = @accounts[deposit.account]
        if account
          balance = account.balances[deposit.currency]
          if balance
            balance.deposit(deposit.amount)
            @lastTransaction = deposit.id
            @emit 'deposit', deposit
          else
            throw new Error('Currency is not supported')
        else
          throw new Error 'Account does not exist'
      else
        throw new Error 'Must supply timestamp'
    else
      throw new Error 'Must supply transaction ID'

  withdraw: (withdrawal) =>
    if withdrawal.id
      if withdrawal.timestamp
        account = @accounts[withdrawal.account]
        if account
          balance = account.balances[withdrawal.currency]
          if balance
            balance.withdraw(withdrawal.amount)
            @lastTransaction = withdrawal.id
            @emit 'withdrawal', withdrawal
          else
            throw new Error('Currency is not supported')
        else
          throw new Error('Account does not exist')
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
    account = @accounts[order.account]
    if account
      books = @books[order.bidCurrency]
      if books
        book = books[order.offerCurrency]
        if book
          account.submit order
          book.submit order
          @lastTransaction = order.id
          # forward trade events from the order
          order.on 'trade', (trade) =>
            @emit 'trade', trade
          # emit an order added event
          @emit 'order', order
          # check the books to see if any orders can be executed
          execute book, @books[order.offerCurrency][order.bidCurrency]
        else
          throw new Error('Offer currency is not supported')
      else
        throw new Error('Bid currency is not supported')
    else
      throw new Error('Account does not exist')

  cancel: (cancellation) =>
    order = @accounts[cancellation.order.account].balances[cancellation.order.offerCurrency].offers[cancellation.order.id]
    if order
      @books[order.bidCurrency][order.offerCurrency].cancel order
      @accounts[order.account].cancel order
      @lastTransaction = cancellation.id
      @emit 'cancellation', cancellation
    else
      throw new Error 'Order cannot be found'
