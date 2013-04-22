Account = require('./Account/Account')
Book = require('./Book')
Order = require('./Order')
Amount = require('./Amount')

module.exports = class Market
  constructor: (@currencies) ->
    @accounts = Object.create null
    @books = Object.create null
    @currencies.forEach (bidCurrency) =>
      @books[bidCurrency] = Object.create null
      @currencies.forEach (orderCurrency) =>
        if bidCurrency != orderCurrency
          @books[bidCurrency][orderCurrency] = new Book()

  addAccount: (name) ->
    if @accounts[name]
      throw new Error('Account already exists')
    else
      @accounts[name] = new Account(@currencies)

  deposit: (deposit) =>
    account = @accounts[deposit.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      balance = account.balances[deposit.currency]
      if typeof balance == 'undefined'
        throw new Error('Currency is not supported')
      else
        balance.deposit(new Amount(deposit.amount))

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

  add: (order) =>
    order = new Order(order)
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
          # check the books to see if any orders can be executed
          @execute(book, @books[order.offerCurrency][order.bidCurrency])

  delete: (order) =>
    order = new Order(order)
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
          book.delete(order)
          balance.unlock(order.offerAmount)

  execute: (leftBook, rightBook) =>
    leftOrder = leftBook.highest
    rightOrder = rightBook.highest
    if typeof leftOrder != 'undefined' && typeof rightOrder != 'undefined'
      if leftOrder.bidPrice.compareTo(rightOrder.offerPrice) >= 0
        # just added an order to the left book so the left order must be
        # the most recent addition if we get here. This means that we should
        # take the price from the right order
        leftBidPrice = rightOrder.offerPrice

        # remember we may have calculated the left bid amount based on a higher price
        leftBidAmount = leftOrder.offerAmount.multiply(rightOrder.bidPrice)

        if rightOrder.offerAmount.compareTo(leftBidAmount) > 0
          # record the amount to unlock
          leftBalanceUnlockAmount = leftOrder.offerAmount
          leftBook.delete(leftOrder)
          rightOrder.reduceOffer(leftBidAmount)
        else
          # remember we may have locked funds based on a higher price
          leftBalanceUnlockAmount = rightOrder.offerAmount.multiply(leftOrder.bidPrice)

          leftBidAmount = rightOrder.offerAmount
          leftOrder.reduceBid(leftBidAmount)
          rightBook.delete(rightOrder)
          if leftOrder.bidAmount.compareTo(Amount.ZERO) == 0
            leftBook.delete(leftOrder)

        leftOfferAmount = leftBidPrice.multiply(leftBidAmount)

        console.log()
        console.log('leftOfferAmount: ' + leftOfferAmount)
        console.log('leftBidAmount: ' + leftBidAmount)

        leftBalances = @accounts[leftOrder.account].balances
        rightBalances = @accounts[rightOrder.account].balances

        # debit the bid account and credit the offer account
        leftOfferCurrency = leftOrder.offerCurrency
        leftBalances[leftOfferCurrency].unlock(leftBalanceUnlockAmount)
        leftBalances[leftOfferCurrency].withdraw(leftOfferAmount)
        rightBalances[leftOfferCurrency].deposit(leftOfferAmount)

        # debit the offer account and credit the bid account
        leftBidCurrency = leftOrder.bidCurrency
        rightBalances[leftBidCurrency].unlock(leftBidAmount)
        rightBalances[leftBidCurrency].withdraw(leftBidAmount)
        leftBalances[leftBidCurrency].deposit(leftBidAmount)





