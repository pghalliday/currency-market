Account = require('../src/Account')
Amount = require('../src/Amount')
Market = require('../src/Market')
Bid = require('../src/Bid')
uuid = require('node-uuid')

module.exports = class Controller
  constructor: (@state) ->
    
  createAccount: (name) ->
    if @state.accounts[name]
      throw new Error('Account already exists')
    else
      @state.accounts[name] = new Account()

  deposit: (params) ->
    account = @state.accounts[params.account]
    if account
      amount = new Amount(params.amount)
      currency = account.currencies[params.currency]
      if typeof currency == 'undefined'
        account.currencies[params.currency] = amount
      else
        account.currencies[params.currency] = currency.add(amount)
    else
      throw new Error('Account does not exist')

  insertBid: (params) ->
    account = @state.accounts[params.account]
    if account
      currency = account.currencies[params.offerCurrency]
      if typeof currency == 'undefined'
        account.currencies[params.currency] = currency = new Amount()
      amount = new Amount(params.amount)
      price = new Amount(params.price)
      requiredFunds = amount.multiply(price)
      if currency.compareTo(requiredFunds) < 0
        throw new Error('Not enough currency to fund the bid')
      else
        bidMarket = @state.markets[params.bidCurrency]
        if typeof bidMarket == 'undefined'
          @state.markets[params.bidCurrency] = bidMarket = Object.create null
        offerMarket = bidMarket[params.offerCurrency]
        if typeof offerMarket == 'undefined'
          bidMarket[params.offerCurrency] = offerMarket = new Market()
        id = uuid.v1()
        offerMarket.bids[id] = new Bid
          price: price,
          amount: amount
        return id
    else
      throw new Error('Account does not exist')
