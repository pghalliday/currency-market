# This test places random offer orders distributed around a fixed price, spread and amount
# in each iteration all accounts cancel their previous orders refresh 
# balances (by withdrawing and depositing) and set new orders
# the number of trades may vary

Engine = require('../src').Engine
Amount = require('../src').Amount
Operation = require('../src').Operation

# randgen library gives me a poisson distribution function
poisson = require('randgen').rpoisson

COMMISSION_RATE = new Amount '0.001'

module.exports = class RandomOfferOffer
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
        offerPrice1 = new Amount offerPrice + ''
        offerAmount1 = new Amount (poisson params.amount) + ''
        offerPrice2 = new Amount (1 / price) + ''
        offerAmount2 = new Amount (price * (poisson params.amount)) + ''
        @randomParameters[accountId][iteration] = 
          offerPrice1: offerPrice1
          offerAmount1: offerAmount1
          offerPrice2: offerPrice2
          offerAmount2: offerAmount2
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
            amount: parameters.offerAmount1
        @orders++
        delta = @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          submit:
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            offerPrice: parameters.offerPrice1
            offerAmount: parameters.offerAmount1
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
            amount: parameters.offerAmount2
        @orders++
        delta = @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          submit:
            bidCurrency: 'EUR'
            offerCurrency: 'BTC'
            offerPrice: parameters.offerPrice2
            offerAmount: parameters.offerAmount2
        if delta.result.trades
          @trades += delta.result.trades.length

    @time = process.hrtime startTime
