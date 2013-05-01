Account = require('./Account')
Book = require('./Book')
Order = require('./Order')
Amount = require('./Amount')
EventEmitter = require('events').EventEmitter

module.exports = class Market extends EventEmitter
  constructor: (params) ->
    @accounts = Object.create null
    @books = Object.create null
    @orders = Object.create null
    if params.state
      @lastTransaction = params.state.lastTransaction
      @currencies = params.state.currencies
      Object.keys(params.state.orders).forEach (id) =>
        @orders[id] = new Order
          state: params.state.orders[id]
      Object.keys(params.state.accounts).forEach (id) =>
        @accounts[id] = new Account
          state: params.state.accounts[id]
          orders: @orders
      Object.keys(params.state.books).forEach (bidCurrency) =>
        @books[bidCurrency] = Object.create null
        Object.keys(params.state.books[bidCurrency]).forEach (offerCurrency) =>
          @books[bidCurrency][offerCurrency] = new Book
            state: params.state.books[bidCurrency][offerCurrency]
            orders: @orders
    else
      @currencies = params.currencies
      @currencies.forEach (offerCurrency) =>
        @books[offerCurrency] = Object.create null
        @currencies.forEach (bidCurrency) =>
          if bidCurrency != offerCurrency
            @books[offerCurrency][bidCurrency] = new Book()

  export: =>
    state = Object.create null
    state.lastTransaction = @lastTransaction
    state.currencies = @currencies
    state.orders = Object.create null
    state.accounts = Object.create null
    state.books = Object.create null
    Object.keys(@orders).forEach (id) =>
      state.orders[id] = @orders[id].export()
    Object.keys(@accounts).forEach (id) =>
      state.accounts[id] = @accounts[id].export()
    Object.keys(@books).forEach (bidCurrency) =>
      state.books[bidCurrency] = Object.create null
      Object.keys(@books[bidCurrency]).forEach (offerCurrency) =>
        state.books[bidCurrency][offerCurrency] = @books[bidCurrency][offerCurrency].export()
    return state

  register: (account) =>
    if @accounts[account.id]
      throw new Error('Account already exists')
    else
      @accounts[account.id] = account
      @lastTransaction = account.id
      @emit 'account', account

  deposit: (deposit) =>
    if typeof deposit.id == 'undefined'
      throw new Error 'Must supply transaction ID'
    else
      if typeof deposit.timestamp == 'undefined'
        throw new Error 'Must supply timestamp'
      else
        account = @accounts[deposit.account]
        if typeof account == 'undefined'
          throw new Error 'Account does not exist'
        else
          balance = account.balances[deposit.currency]
          if typeof balance == 'undefined'
            throw new Error('Currency is not supported')
          else
            balance.deposit(deposit.amount)
            @lastTransaction = deposit.id
            @emit 'deposit', deposit

  withdraw: (withdrawal) =>
    if typeof withdrawal.id == 'undefined'
      throw new Error 'Must supply transaction ID'
    else
      if typeof withdrawal.timestamp == 'undefined'
        throw new Error 'Must supply timestamp'
      else
        account = @accounts[withdrawal.account]
        if typeof account == 'undefined'
          throw new Error('Account does not exist')
        else
          balance = account.balances[withdrawal.currency]
          if typeof balance == 'undefined'
            throw new Error('Currency is not supported')
          else
            balance.withdraw(withdrawal.amount)
            @lastTransaction = withdrawal.id
            @emit 'withdrawal', withdrawal

  execute = (leftBook, rightBook) ->
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if typeof leftOrder != 'undefined' && typeof rightOrder != 'undefined'
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order
        tryAgain = leftOrder.match rightOrder
        if tryAgain
          execute leftBook, rightBook

  submit: (order) =>
    account = @accounts[order.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      books = @books[order.bidCurrency]
      if typeof books == 'undefined'
        throw new Error('Bid currency is not supported')
      else
        book = books[order.offerCurrency]
        if typeof book == 'undefined'
          throw new Error('Offer currency is not supported')
        else
          account.submit order
          book.submit order
          @orders[order.id] = order
          order.on 'fill', (fill) =>
            if order.bidAmount.compareTo(Amount.ZERO) == 0
              delete @orders[order.id]
          @lastTransaction = order.id
          # forward trade events from the order
          order.on 'trade', (trade) =>
            @emit 'trade', trade
          # emit an order added event
          @emit 'order', order
          # check the books to see if any orders can be executed
          execute(book, @books[order.offerCurrency][order.bidCurrency])

  cancel: (cancellation) =>
    order = @orders[cancellation.order]
    if order
      @books[order.bidCurrency][order.offerCurrency].cancel(order)
      @accounts[order.account].cancel order
      @lastTransaction = cancellation.id
      @emit 'cancellation', cancellation
    else
      throw new Error 'Order cannot be found'

  equals: (market) =>
    equal = true
    if typeof @lastTransaction == 'undefined'
      if typeof market.lastTransaction != 'undefined'
        equal = false
    else
      if @lastTransaction != market.lastTransaction
        equal = false
    if equal
      Object.keys(@orders).forEach (id) =>
        if market.orders[id]
          if !(@orders[id].equals market.orders[id])
            equal = false
        else
          equal = false
      if equal
        Object.keys(market.orders).forEach (id) =>
          if !@orders[id]
            equal = false
        if equal
          @currencies.forEach (currency) =>
            if market.currencies.indexOf(currency) == -1
              equal = false
          if equal
            market.currencies.forEach (currency) =>
              if @currencies.indexOf(currency) == -1
                equal = false
            if equal
              Object.keys(@accounts).forEach (id) =>
                if !market.accounts[id]
                  equal = false
              if equal
                Object.keys(market.accounts).forEach (id) =>
                  if !@accounts[id]
                    equal = false
                  else
                    if !@accounts[id].equals(market.accounts[id])
                      equal = false
                if equal
                  Object.keys(@books).forEach (bidCurrency) =>
                    if Object.keys(market.books).indexOf(bidCurrency) == -1
                      equal = false
                  if equal
                    Object.keys(market.books).forEach (bidCurrency) =>
                      if Object.keys(@books).indexOf(bidCurrency) == -1
                        equal = false
                      else
                        Object.keys(@books[bidCurrency]).forEach (offerCurrency) =>
                          if Object.keys(market.books[bidCurrency]).indexOf(offerCurrency) == -1
                            equal = false
                        if equal
                          Object.keys(market.books[bidCurrency]).forEach (offerCurrency) =>
                            if Object.keys(@books[bidCurrency]).indexOf(offerCurrency) == -1
                              equal = false
                            else
                              if !@books[bidCurrency][offerCurrency].equals(market.books[bidCurrency][offerCurrency])
                                equal = false              
    return equal