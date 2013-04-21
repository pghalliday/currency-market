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
          @execute(book, @books[order.offerCurrency][order.bidCurrency])

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

  execute: (bidBook, offerBook) ->
    highestBid = bidBook.highest
    lowestOffer = offerBook.highest
    if typeof highestBid != 'undefined' && typeof lowestOffer != 'undefined'
      if highestBid.bidPrice.compareTo(lowestOffer.offerPrice) == 0
        bidAccount = @accounts[highestBid.account]
        offerAccount = @accounts[lowestOffer.account]

        if highestBid.offerAmount.compareTo(lowestOffer.bidAmount) == 0
          # debit the bid account and credit the offer account
          bidAccount.balances[highestBid.offerCurrency].unlock(highestBid.offerAmount)
          bidAccount.balances[highestBid.offerCurrency].withdraw(highestBid.offerAmount)
          offerAccount.balances[highestBid.offerCurrency].deposit(highestBid.offerAmount)
          # debit the offer account and credit the bid account
          offerAccount.balances[lowestOffer.offerCurrency].unlock(lowestOffer.offerAmount)
          offerAccount.balances[lowestOffer.offerCurrency].withdraw(lowestOffer.offerAmount)
          bidAccount.balances[lowestOffer.offerCurrency].deposit(lowestOffer.offerAmount)
          # remove the orders
          bidBook.delete(highestBid)
          offerBook.delete(lowestOffer)
        else if highestBid.offerAmount.compareTo(lowestOffer.bidAmount) > 0
          # more is being offered than is bid for so use the bid amount
          # debit the bid account and credit the offer account
          bidAccount.balances[lowestOffer.bidCurrency].unlock(lowestOffer.bidAmount)
          bidAccount.balances[lowestOffer.bidCurrency].withdraw(lowestOffer.bidAmount)
          offerAccount.balances[lowestOffer.bidCurrency].deposit(lowestOffer.bidAmount)
          # debit the offer account and credit the bid account
          offerAccount.balances[lowestOffer.offerCurrency].unlock(lowestOffer.offerAmount)
          offerAccount.balances[lowestOffer.offerCurrency].withdraw(lowestOffer.offerAmount)
          bidAccount.balances[lowestOffer.offerCurrency].deposit(lowestOffer.offerAmount)
          # remove the orders
          highestBid.reduceBid(lowestOffer.offerAmount)
          offerBook.delete(lowestOffer)
        else
          # use the offer amount
          # debit the bid account and credit the offer account
          bidAccount.balances[highestBid.offerCurrency].unlock(highestBid.offerAmount)
          bidAccount.balances[highestBid.offerCurrency].withdraw(highestBid.offerAmount)
          offerAccount.balances[highestBid.offerCurrency].deposit(highestBid.offerAmount)
          # debit the offer account and credit the bid account
          offerAccount.balances[highestBid.bidCurrency].unlock(highestBid.bidAmount)
          offerAccount.balances[highestBid.bidCurrency].withdraw(highestBid.bidAmount)
          bidAccount.balances[highestBid.bidCurrency].deposit(highestBid.bidAmount)
          # remove the orders
          bidBook.delete(highestBid)
          lowestOffer.reduceOffer(highestBid.bidAmount)






