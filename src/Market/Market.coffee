Book = require('./Book')
Account = require('./Account/Account')

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
      currency = account.currencies[deposit.currency]
      if typeof currency == 'undefined'
        throw new Error('Currency is not supported')
      else
        currency.deposit(deposit)

  withdraw: (withdrawal) ->
    account = @accounts[withdrawal.account]
    if typeof account == 'undefined'
      throw new Error('Account does not exist')
    else
      currency = account.currencies[withdrawal.currency]
      if typeof currency == 'undefined'
        throw new Error('Currency is not supported')
      else
        currency.withdraw(withdrawal)


