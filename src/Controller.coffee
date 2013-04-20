Account = require('./Market/Account/Account')
Amount = require('./Market/Amount')
Currency = require('./Market/Account/Currency')
Book = require('./Market/Book')
Order = require('./Market/Order')
uuid = require('node-uuid')

module.exports = class Controller
  constructor: (@market) ->

  deposit: (params) ->
    account = @market.accounts[params.account]
    if account
      amount = new Amount(params.amount)
      currency = account.getCurrency(params.currency)
      currency.funds = currency.funds.add(amount)
    else
      throw new Error('Account does not exist')

  insertBid: (params) ->
    account = @market.accounts[params.account]
    if account
      currency = account.getCurrency(params.offerCurrency)
      bid = new Bid(params)
      requiredFunds = bid.total.add(currency.reservedFunds)
      if currency.funds.compareTo(requiredFunds) < 0
        throw new Error('Not enough currency to fund the bid')
      else
        bids = currency.getBids(params.bidCurrency)
        market = @market.getMarket(params)
        market.bids[params.id] = bid
        bids[params.id] = bid
        currency.reservedFunds = currency.reservedFunds.add(bid.total)
    else
      throw new Error('Account does not exist')

  deleteBid: (params) ->
    account = @market.accounts[params.account]
    if account
      currency = account.getCurrency(params.offerCurrency)
      bids = currency.getBids(params.bidCurrency)
      market = @market.getMarket(params)
      bid = bids[params.id]
      if typeof bid == 'undefined'
        throw new Error('bid could not be located')
      else
        delete bids[params.id]
        delete market.bids[params.id]
        currency.reservedFunds = currency.reservedFunds.subtract(bid.total)
    else
      throw new Error('Account does not exist')

