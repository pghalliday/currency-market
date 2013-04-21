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

  deposit: (deposit) ->
    account = @accounts[deposit.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      balance = account.balances[deposit.currency]
      if typeof balance == 'undefined'
        throw new Error('Currency is not supported')
      else
        balance.deposit(new Amount(deposit.amount))

  withdraw: (withdrawal) ->
    account = @accounts[withdrawal.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      balance = account.balances[withdrawal.currency]
      if typeof balance == 'undefined'
        throw new Error('Currency is not supported')
      else
        balance.withdraw(new Amount(withdrawal.amount))

  add: (order) ->
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
          @execute(book, @books[order.offerCurrency][order.bidCurrency], order)

  delete: (order) ->
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

  execute: (bidBook, offerBook, lastOrder) ->
    highestBid = bidBook.highest
    lowestOffer = offerBook.highest
    if typeof highestBid != 'undefined' && typeof lowestOffer != 'undefined'
      if highestBid.bidPrice.compareTo(lowestOffer.offerPrice) >= 0
        bidBalances = @accounts[highestBid.account].balances
        offerBalances = @accounts[lowestOffer.account].balances
        bidCurrency = highestBid.offerCurrency
        offerCurrency = highestBid.bidCurrency

        if highestBid == lastOrder
          executionBidPrice = lowestOffer.offerPrice
          executionOfferPrice = lowestOffer.bidPrice
          highestBidOfferAmount = highestBid.bidAmount.multiply(executionBidPrice)
          lowestOfferBidAmount = lowestOffer.bidAmount
        else
          executionBidPrice = highestBid.bidPrice
          executionOfferPrice = highestBid.offerPrice
          highestBidOfferAmount = highestBid.offerAmount
          lowestOfferBidAmount = lowestOffer.offerAmount.multiply(executionBidPrice)

        console.log()
        console.log(highestBidOfferAmount.toString())
        console.log(lowestOfferBidAmount.toString())

        if highestBidOfferAmount.compareTo(lowestOfferBidAmount) == 0
          # debit the bid account and credit the offer account
          bidTrade = highestBidOfferAmount
          offerTrade = highestBidOfferAmount.multiply(executionOfferPrice)
          # remove the orders
          bidBook.delete(highestBid)
          offerBook.delete(lowestOffer)
        else if highestBidOfferAmount.compareTo(lowestOfferBidAmount) > 0
          # more is being offered than is bid for so use the bid amount
          bidTrade = lowestOfferBidAmount
          offerTrade = lowestOfferBidAmount.multiply(executionOfferPrice)
          # remove/reduce the orders
          highestBid.reduceOffer(bidTrade)
          offerBook.delete(lowestOffer)
        else
          # use the offer amount
          bidTrade = highestBidOfferAmount
          offerTrade = highestBidOfferAmount.multiply(executionOfferPrice)
          # remove/reduce the orders
          bidBook.delete(highestBid)
          lowestOffer.reduceOffer(offerTrade)

        # debit the bid account and credit the offer account
        bidBalances[bidCurrency].unlock(bidTrade)
        bidBalances[bidCurrency].withdraw(bidTrade)
        offerBalances[bidCurrency].deposit(bidTrade)
        # debit the offer account and credit the bid account
        offerBalances[offerCurrency].unlock(offerTrade)
        offerBalances[offerCurrency].withdraw(offerTrade)
        bidBalances[offerCurrency].deposit(offerTrade)





