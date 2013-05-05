# This test does trades in pairs to push funds around a circle of accounts

Market = require '../src/Market'
Account = require '../src/Account'
Amount = require '../src/Amount'
Order = require '../src/Order'

transactionId = 100000
nextTransactionId = ->
  return transactionId++

TIMESTAMP = '1366758222'

module.exports = class PassItOn
  constructor: (params) ->
    @iterations = [1..params.iterations]
    @accounts = []
    @market = new Market()
    [1..params.accounts].forEach (index) =>
      accountId = nextTransactionId()
      if index == 1
        # first account gets the EUR to pass round
        @market.deposit
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'EUR'
          amount: new Amount '5000'
      else
        # other accounts get BTC
        @market.deposit
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'BTC'
          amount: new Amount '50'
      @accounts.push accountId

    @trades = 0
    @market.on 'trade', (trade) =>
      @trades++

  execute: =>
    startTime = process.hrtime()
    @iterations.forEach =>
      lastAccount = null
      firstAccount = null
      @accounts.forEach (accountId) =>
        if lastAccount
          # fulfill the order from the last account
          @market.submit new Order
            id: nextTransactionId()
            timestamp: TIMESTAMP
            account: accountId
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            offerPrice: new Amount '100'
            offerAmount: new Amount '50'          
        else
          # record this as the first account so we can complete the circle
          firstAccount = accountId

        # order some BTC
        @market.submit new Order
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: new Amount '100'
          bidAmount: new Amount '50'

        # set the last account
        lastAccount = accountId

      # now we can complete the circle and give the EUR back to the first account
      @market.submit new Order
        id: nextTransactionId()
        timestamp: TIMESTAMP
        account: firstAccount
        bidCurrency: 'EUR'
        offerCurrency: 'BTC'
        offerPrice: new Amount '100'
        offerAmount: new Amount '50'          

    @time = process.hrtime startTime
