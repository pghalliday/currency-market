# This test places random bid orders distributed around a fixed price, spread and amount
# in each iteration all accounts cancel their previous orders refresh 
# balances (by withdrawing and depositing) and set new orders
# the number of trades may vary

Engine = require('../src').Engine
Amount = require('../src').Amount
Operation = require('../src').Operation

# randgen library gives me a poisson distribution function
poisson = require('randgen').rpoisson

COMMISSION_RATE = new Amount '0.001'

module.exports = class RandomBidBid
  constructor: (params) ->
    @operationSequence = 0
    @timestamp = 1371737390976
    @account = 0
    @iterations = [1..params.iterations]
    @accounts = []
    @engine = new Engine
      commission:
        account: 'commission'
        calculate: (params) ->
          amount: params.amount.multiply COMMISSION_RATE
          reference: '0.1%'

    # create the accounts and the random parameters in advance
    # so as not to skew the timings
    # use a poisson distribution to generate positive 
    # random parameters around the given means
    @randomParameters = Object.create null
    [1..params.accounts].forEach =>
      accountId = @nextAccount()
      @randomParameters[accountId] = []
      @iterations.forEach (iteration) =>
        price = poisson params.price
        spread = poisson params.spread
        offerPrice = price + spread
        bidPrice1 = new Amount (1 / offerPrice) + ''
        bidAmount1 = new Amount (offerPrice * (poisson params.amount)) + ''
        requiredBTC = bidAmount1.multiply bidPrice1
        bidPrice2 = new Amount price + ''
        bidAmount2 = new Amount (poisson params.amount) + ''
        requiredEUR = bidAmount2.multiply bidPrice2
        @randomParameters[accountId][iteration] = 
          bidPrice1: bidPrice1
          bidAmount1: bidAmount1
          requiredBTC: requiredBTC
          bidPrice2: bidPrice2
          bidAmount2: bidAmount2
          requiredEUR: requiredEUR
      @accounts.push @engine.getAccount(accountId)

    @trades = 0
    @deposits = 0
    @withdrawals = 0
    @orders = 0
    @cancellations = 0

  nextSequence: =>
    @operationSequence++

  nextTimestamp: =>
    @timestamp++

  nextAccount: =>
    'Account' + @account++

  execute: =>
    startTime = process.hrtime()
    @iterations.forEach (iteration) =>
      # cancel all the outstanding orders
      @accounts.forEach (account) =>
        orders = account.orders
        for sequence of orders
          @cancellations++
          @engine.apply new Operation
            reference: 'hello'
            sequence: @nextSequence()
            timestamp: @nextTimestamp()
            account: account.id
            cancel:
              sequence: sequence

      # withdraw funds, make deposits and place new orders
      @accounts.forEach (account) =>
        accountId = account.id
        parameters = @randomParameters[accountId][iteration]
        @withdrawals++
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          withdraw:
            currency: 'EUR'
            amount: account.getBalance('EUR').funds
        @withdrawals++
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          withdraw:
            currency: 'BTC'
            amount: account.getBalance('BTC').funds
        @deposits++
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          deposit:
            currency: 'EUR'
            amount: parameters.requiredEUR
        @orders++
        delta = @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          submit:
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            bidPrice: parameters.bidPrice2
            bidAmount: parameters.bidAmount2
        if delta.result.trades
          @trades += delta.result.trades.length
        @deposits++
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          deposit:
            currency: 'BTC'
            amount: parameters.requiredBTC
        @orders++
        delta = @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          submit:
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            bidPrice: parameters.bidPrice1
            bidAmount: parameters.bidAmount1
        if delta.result.trades
          @trades += delta.result.trades.length

    @time = process.hrtime startTime
