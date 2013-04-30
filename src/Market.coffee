Account = require('./Account')
Book = require('./Book')
Order = require('./Order')
Amount = require('./Amount')
EventEmitter = require('events').EventEmitter

module.exports = class Market extends EventEmitter
  constructor: (params) ->
    @accounts = Object.create null
    @books = Object.create null
    if params.state
      @lastTransaction = params.state.lastTransaction
      @currencies = params.state.currencies
      Object.keys(params.state.accounts).forEach (id) =>
        @accounts[id] = new Account
          state: params.state.accounts[id]
      Object.keys(params.state.books).forEach (bidCurrency) =>
        @books[bidCurrency] = Object.create null
        Object.keys(params.state.books[bidCurrency]).forEach (offerCurrency) =>
          @books[bidCurrency][offerCurrency] = new Book
            state: params.state.books[bidCurrency][offerCurrency]
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
    state.accounts = Object.create null
    state.books = Object.create null
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

  submit: (order) =>
    account = @accounts[order.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      balance = account.balances[order.offerCurrency]
      if typeof balance == 'undefined'
        throw new Error('Offer currency is not supported')
      else
        books = @books[order.bidCurrency]
        if typeof books == 'undefined'
          throw new Error('Bid currency is not supported')
        else
          book = books[order.offerCurrency]
          balance.lock order.offerAmount
          book.add order
          # emit an order added event
          @lastTransaction = order.id
          @emit 'order', order
          # forward trade events from the order
          order.on 'trade', (trade) =>
            @emit 'trade', trade
          # check the books to see if any orders can be executed
          @execute(book, @books[order.offerCurrency][order.bidCurrency])

  execute: (leftBook, rightBook) =>
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if typeof leftOrder != 'undefined' && typeof rightOrder != 'undefined'
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order
        onRightFill = (fill) =>
          order = fill.order
          balances = @accounts[order.account].balances
          debitBalance = balances[order.offerCurrency]
          creditBalance = balances[order.bidCurrency]
          debitBalance.unlock fill.offerAmount
          debitBalance.withdraw fill.offerAmount
          creditBalance.deposit fill.bidAmount
          if order.bidAmount.compareTo(Amount.ZERO) == 0
            rightBook.delete order

        onLeftFill = (fill) =>
          order = fill.order
          balances = @accounts[order.account].balances
          debitBalance = balances[order.offerCurrency]
          creditBalance = balances[order.bidCurrency]
          if order.offerPrice  
            debitBalance.unlock fill.offerAmount
          else
            debitBalance.unlock fill.bidAmount.multiply order.bidPrice
          debitBalance.withdraw fill.offerAmount
          creditBalance.deposit fill.bidAmount
          if order.bidAmount.compareTo(Amount.ZERO) == 0
            leftBook.delete order

        rightOrder.on 'fill', onRightFill
        leftOrder.on 'fill', onLeftFill
        tryAgain = leftOrder.match rightOrder
        rightOrder.removeListener 'fill', onRightFill
        leftOrder.removeListener 'fill', onLeftFill
        if tryAgain
          @execute leftBook, rightBook

  cancel: (cancellation) =>
    order = cancellation.order
    @books[order.bidCurrency][order.offerCurrency].delete(order)
    @accounts[order.account].balances[order.offerCurrency].unlock(order.offerAmount)
    @lastTransaction = cancellation.id
    @emit 'cancellation', cancellation

  equals: (market) =>
    equal = true
    if typeof @lastTransaction == 'undefined'
      if typeof market.lastTransaction != 'undefined'
        equal = false
    else
      if @lastTransaction != market.lastTransaction
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
            if Object.keys(market.accounts).indexOf(id) == -1
              equal = false
          if equal
            Object.keys(market.accounts).forEach (id) =>
              if Object.keys(@accounts).indexOf(id) == -1
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