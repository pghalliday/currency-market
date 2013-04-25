Account = require('./Account')
Book = require('./Book')
Order = require('./Order')
Amount = require('./Amount')
EventEmitter = require('events').EventEmitter

module.exports = class CurrencyMarket extends EventEmitter
  constructor: (params) ->
    @accounts = Object.create null
    @orders = Object.create null
    @books = Object.create null
    if typeof params.state == 'undefined'
      @currencies = params.currencies
      @currencies.forEach (offerCurrency) =>
        @books[offerCurrency] = Object.create null
        @currencies.forEach (bidCurrency) =>
          if bidCurrency != offerCurrency
            @books[offerCurrency][bidCurrency] = new Book()
    else
      @currencies = params.state.currencies
      Object.keys(params.state.accounts).forEach (id) =>
        @accounts[id] = new Account
          state: params.state.accounts[id]
      Object.keys(params.state.orders).forEach (id) =>
        @orders[id] = new Order
          state: params.state.orders[id]
      Object.keys(params.state.books).forEach (offerCurrency) =>
        @books[offerCurrency] = Object.create null
        Object.keys(params.state.books[offerCurrency]).forEach (bidCurrency) =>
          @books[offerCurrency][bidCurrency] = new Book
            state: params.state.books[offerCurrency][bidCurrency]
            orders: @orders

  export: =>
    state = Object.create null
    state.currencies = @currencies
    state.accounts = Object.create null
    state.orders = Object.create null
    state.books = Object.create null
    Object.keys(@accounts).forEach (id) =>
      state.accounts[id] = @accounts[id].export()
    Object.keys(@orders).forEach (id) =>
      state.orders[id] = @orders[id].export()
    Object.keys(@books).forEach (offerCurrency) =>
      state.books[offerCurrency] = Object.create null
      Object.keys(@books[offerCurrency]).forEach (bidCurrency) =>
        state.books[offerCurrency][bidCurrency] = @books[offerCurrency][bidCurrency].export()
    return state

  register: (params) =>
    if @accounts[params.key]
      throw new Error('Account already exists')
    else
      @accounts[params.key] = new Account
        id: params.id
        key: params.key
        timestamp: params.timestamp
        currencies: @currencies
      @emit 'account', params

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
            balance.deposit(new Amount(deposit.amount))
            @emit 'deposit', deposit

  withdraw: (withdrawal) =>
    account = @accounts[withdrawal.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      balance = account.balances[withdrawal.currency]
      if typeof balance == 'undefined'
        throw new Error('Currency is not supported')
      else
        balance.withdraw(new Amount(withdrawal.amount))
        @emit 'withdrawal', withdrawal

  submit: (params) =>
    order = new Order(params)
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
          balance.lock(order.offerAmount)
          book.add(order)
          @orders[order.id] = order
          # emit an order added event
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
        leftOfferCurrency = leftOrder.offerCurrency
        leftBidCurrency = leftOrder.bidCurrency

        rightBidAmount = rightOrder.bidAmount
        rightOfferAmount = rightOrder.offerAmount
        if leftOrder.fillOffer
          leftOfferAmount = leftOrder.offerAmount
          leftBidAmount = leftOrder.offerAmount.multiply(rightOrder.bidPrice)
          leftOfferReduction = rightOfferAmount.multiply(rightOrder.offerPrice)
        else
          leftBidAmount = leftOrder.bidAmount
          leftOfferAmount = leftBidAmount.multiply(rightOrder.offerPrice)
          leftOfferReduction = rightOfferAmount.multiply(leftOrder.bidPrice)

        if leftOfferAmount.compareTo(rightBidAmount) > 0
          # trade the rightBidAmount
          leftBalances[leftOfferCurrency].unlock(leftOfferReduction)
          leftBalances[leftOfferCurrency].withdraw(rightBidAmount)
          rightBalances[leftOfferCurrency].deposit(rightBidAmount)
          rightBalances[leftBidCurrency].unlock(rightOfferAmount)
          rightBalances[leftBidCurrency].withdraw(rightOfferAmount)
          leftBalances[leftBidCurrency].deposit(rightOfferAmount)
          # delete the right order
          rightBook.delete(rightOrder)
          delete @orders[rightOrder.id]
          # reduce the left order
          leftOrder.reduceOffer(leftOfferReduction)
          # emit a trade event
          @emit 'trade',
            left:
              currency: leftBidCurrency
              amount: rightOfferAmount.toString()
              price: rightOrder.offerPrice.toString()
              account: leftOrder.account
            right:
              currency: leftOfferCurrency
              amount: rightBidAmount.toString()
              price: rightOrder.bidPrice.toString()
              account: rightOrder.account

          # call execute again to see if any more orders can be satified
          @execute(leftBook, rightBook)
        else
          # trade the leftOfferAmount
          leftBalances[leftOfferCurrency].unlock(leftOrder.offerAmount)
          leftBalances[leftOfferCurrency].withdraw(leftOfferAmount)
          rightBalances[leftOfferCurrency].deposit(leftOfferAmount)
          rightBalances[leftBidCurrency].unlock(leftBidAmount)
          rightBalances[leftBidCurrency].withdraw(leftBidAmount)
          leftBalances[leftBidCurrency].deposit(leftBidAmount)
          # delete the left order
          leftBook.delete(leftOrder)
          delete @orders[leftOrder.id]
          # reduce the right order
          rightOrder.reduceBid(leftOfferAmount)
          # delete the right order if now has a zero amount
          if rightOrder.bidAmount.compareTo(Amount.ZERO) == 0
            rightBook.delete(rightOrder)
            delete @orders[rightOrder.id]
          @emit 'trade',
            left:
              currency: leftBidCurrency
              amount: leftBidAmount.toString()
              price: rightOrder.offerPrice.toString()
              account: leftOrder.account
            right:
              currency: leftOfferCurrency
              amount: leftOfferAmount.toString()
              price: rightOrder.bidPrice.toString()
              account: rightOrder.account

  cancel: (params) =>
    match = new Order(params)
    order = @orders[match.id]
    if typeof order == 'undefined'
      throw new Error('Order cannot be found')
    else
      if order.equals(match)
        delete @orders[order.id]
        @books[order.bidCurrency][order.offerCurrency].delete(order)
        @accounts[order.account].balances[order.offerCurrency].unlock(order.offerAmount)
        @emit 'cancellation', params
      else
        throw new Error('Order does not match')

  equals: (currencyMarket) =>
    equal = true
    @currencies.forEach (currency) =>
      if currencyMarket.currencies.indexOf(currency) == -1
        equal = false
    if equal
      currencyMarket.currencies.forEach (currency) =>
        if @currencies.indexOf(currency) == -1
          equal = false
      if equal
        Object.keys(@accounts).forEach (id) =>
          if Object.keys(currencyMarket.accounts).indexOf(id) == -1
            equal = false
        if equal
          Object.keys(currencyMarket.accounts).forEach (id) =>
            if Object.keys(@accounts).indexOf(id) == -1
              equal = false
            else
              if !@accounts[id].equals(currencyMarket.accounts[id])
                equal = false
          if equal
            Object.keys(@orders).forEach (id) =>
              if Object.keys(currencyMarket.orders).indexOf(id) == -1
                equal = false
            if equal
              Object.keys(currencyMarket.orders).forEach (id) =>
                if Object.keys(@orders).indexOf(id) == -1
                  equal = false
                else
                  if !@orders[id].equals(currencyMarket.orders[id])
                    equal = false              
              if equal
                Object.keys(@books).forEach (offerCurrency) =>
                  if Object.keys(currencyMarket.books).indexOf(offerCurrency) == -1
                    equal = false
                if equal
                  Object.keys(currencyMarket.books).forEach (offerCurrency) =>
                    if Object.keys(@books).indexOf(offerCurrency) == -1
                      equal = false
                    else
                      Object.keys(@books[offerCurrency]).forEach (bidCurrency) =>
                        if Object.keys(currencyMarket.books[offerCurrency]).indexOf(bidCurrency) == -1
                          equal = false
                      if equal
                        Object.keys(currencyMarket.books[offerCurrency]).forEach (bidCurrency) =>
                          if Object.keys(@books[offerCurrency]).indexOf(bidCurrency) == -1
                            equal = false
                          else
                            if !@books[offerCurrency][bidCurrency].equals(currencyMarket.books[offerCurrency][bidCurrency])
                              equal = false              
    return equal