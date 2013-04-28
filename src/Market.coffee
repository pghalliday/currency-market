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
          # check the books to see if any orders can be executed
          @execute(book, @books[order.offerCurrency][order.bidCurrency])

  execute: (leftBook, rightBook) =>
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if typeof leftOrder != 'undefined' && typeof rightOrder != 'undefined'
      if leftOrder.bidPrice.compareTo(rightOrder.offerPrice) >= 0
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order

        leftBalances = @accounts[leftOrder.account].balances
        rightBalances = @accounts[rightOrder.account].balances
        leftDebitCurrency = leftOrder.offerCurrency
        rightDebitCurrency = rightOrder.offerCurrency

        if leftOrder.type == Order.OFFER
          if rightOrder.type == Order.BID
            # Avoid divisions and prices calculated from divisions
            price = rightOrder.bidPrice
            if leftOrder.offerAmount.compareTo(rightOrder.bidAmount) > 0
              leftDebitAmount = rightOrder.bidAmount
              rightDebitAmount = rightOrder.offerAmount
              leftBalances[leftDebitCurrency].unlock leftDebitAmount
              leftBalances[leftDebitCurrency].withdraw leftDebitAmount
              rightBalances[leftDebitCurrency].deposit leftDebitAmount
              rightBalances[rightDebitCurrency].unlock rightDebitAmount
              rightBalances[rightDebitCurrency].withdraw rightDebitAmount
              leftBalances[rightDebitCurrency].deposit rightDebitAmount
              rightBook.delete rightOrder
              leftOrder.reduceOffer leftDebitAmount

              # emit the trade event with the amounts credited
              @emit 'trade',
              left:
                order: leftOrder
                amount: rightDebitAmount
                price: rightOrder.offerPrice
              right:
                order: rightOrder
                amount: leftDebitAmount
                price: price
              
              # new order was not completely satified so call execute again to see if any more orders can be satified
              @execute(leftBook, rightBook)
            else
              leftDebitAmount = leftOrder.offerAmount
              rightDebitAmount = leftDebitAmount.multiply price
              leftBalances[leftDebitCurrency].unlock leftDebitAmount
              leftBalances[leftDebitCurrency].withdraw leftDebitAmount
              rightBalances[leftDebitCurrency].deposit leftDebitAmount
              rightBalances[rightDebitCurrency].unlock rightDebitAmount
              rightBalances[rightDebitCurrency].withdraw rightDebitAmount
              leftBalances[rightDebitCurrency].deposit rightDebitAmount
              leftBook.delete leftOrder
              rightOrder.reduceBid leftDebitAmount
              if rightOrder.bidAmount.compareTo(Amount.ZERO) == 0
                rightBook.delete rightOrder

              # emit the trade event with the amounts credited
              @emit 'trade',
              left:
                order: leftOrder
                amount: rightDebitAmount
                price: rightOrder.offerPrice
              right:
                order: rightOrder
                amount: leftDebitAmount
                price: price
          else
            # 2 offers cause divisions!
            throw new Error 'Matching 2 offers not yet supported due to possible rounding errors'
        else
          if rightOrder.type == Order.OFFER
            # Avoid divisions and prices calculated from divisions
            price = rightOrder.offerPrice
            if leftOrder.bidAmount.compareTo(rightOrder.offerAmount) > 0
              rightDebitAmount = rightOrder.offerAmount
              leftDebitAmount = rightDebitAmount.multiply price
              leftBalances[leftDebitCurrency].unlock rightDebitAmount.multiply leftOrder.bidPrice
              leftBalances[leftDebitCurrency].withdraw leftDebitAmount
              rightBalances[leftDebitCurrency].deposit leftDebitAmount
              rightBalances[rightDebitCurrency].unlock rightDebitAmount
              rightBalances[rightDebitCurrency].withdraw rightDebitAmount
              leftBalances[rightDebitCurrency].deposit rightDebitAmount
              rightBook.delete rightOrder
              leftOrder.reduceBid rightDebitAmount

              # emit the trade event with the amounts credited
              @emit 'trade',
              left:
                order: leftOrder
                amount: rightDebitAmount
                price: price
              right:
                order: rightOrder
                amount: leftDebitAmount
                price: rightOrder.bidPrice
              
              # new order was not completely satified so call execute again to see if any more orders can be satified
              @execute(leftBook, rightBook)
            else
              rightDebitAmount = leftOrder.bidAmount
              leftDebitAmount = rightDebitAmount.multiply price
              leftBalances[leftDebitCurrency].unlock leftOrder.offerAmount
              leftBalances[leftDebitCurrency].withdraw leftDebitAmount
              rightBalances[leftDebitCurrency].deposit leftDebitAmount
              rightBalances[rightDebitCurrency].unlock rightDebitAmount
              rightBalances[rightDebitCurrency].withdraw rightDebitAmount
              leftBalances[rightDebitCurrency].deposit rightDebitAmount
              leftBook.delete leftOrder
              rightOrder.reduceOffer rightDebitAmount
              if rightOrder.bidAmount.compareTo(Amount.ZERO) == 0
                rightBook.delete rightOrder

              # emit the trade event with the amounts credited
              @emit 'trade',
              left:
                order: leftOrder
                amount: rightDebitAmount
                price: price
              right:
                order: rightOrder
                amount: leftDebitAmount
                price: rightOrder.bidPrice
          else
            # 2 bids cause divisions!
            throw new Error 'Matching 2 bids not yet supported due to possible rounding errors'

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