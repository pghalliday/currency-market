Account = require('../src/Account')
Amount = require('../src/Amount')
Currency = require('../src/Currency')
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
      currency = account.getCurrency(params.currency)
      currency.funds = currency.funds.add(amount)
    else
      throw new Error('Account does not exist')

  insertBid: (params) ->
    account = @state.accounts[params.account]
    if account
      currency = account.getCurrency(params.offerCurrency)
      amount = new Amount(params.amount)
      price = new Amount(params.price)
      additionalRequiredFunds = amount.multiply(price)
      requiredFunds = additionalRequiredFunds.add(currency.reservedFunds)
      if currency.funds.compareTo(requiredFunds) < 0
        throw new Error('Not enough currency to fund the bid')
      else
        bids = currency.getBids(params.bidCurrency)
        market = @state.getMarket(params)
        bid = new Bid
          price: price,
          amount: amount
        market.bids[params.id] = bid
        bids[params.id] = bid
        currency.reservedFunds = currency.reservedFunds.add(additionalRequiredFunds)
    else
      throw new Error('Account does not exist')

  deleteBid: (params) ->
    account = @state.accounts[params.account]
    if account
      currency = account.getCurrency(params.offerCurrency)
      bids = currency.getBids(params.bidCurrency)
      market = @state.getMarket(params)
      bid = bids[params.id]
      if typeof bid == 'undefined'
        throw new Error('bid could not be located')
      else
        freedFunds = bid.amount.multiply(bid.price)
        delete bids[params.id]
        delete market.bids[params.id]
        currency.reservedFunds = currency.reservedFunds.subtract(freedFunds)
    else
      throw new Error('Account does not exist')

