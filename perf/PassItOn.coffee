# This test does trades in pairs to push funds around a circle of accounts

Engine = require('../src').Engine
Amount = require('../src').Amount
Operation = require('../src').Operation

module.exports = class PassItOn
  constructor: (params) ->
    @operationSequence = 0
    @timestamp = 1371737390976
    @account = 0
    @iterations = [1..params.iterations]
    @accounts = []
    @engine = new Engine
      commission:
        account: 'commission'
        calculate: ->
          amount: Amount.ZERO
          reference: 'No commission'
    [1..params.accounts].forEach (index) =>
      accountId = @nextAccount()
      if index == 1
        # first account gets the EUR to pass round
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          deposit:
            currency: 'EUR'
            amount: new Amount '5000'
      else
        # other accounts get BTC
        @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          deposit:
            currency: 'BTC'
            amount: new Amount '50'
      @accounts.push accountId
    @trades = 0

  nextSequence: =>
    @operationSequence++

  nextTimestamp: =>
    @timestamp++

  nextAccount: =>
    'Account' + @account++

  execute: =>
    startTime = process.hrtime()
    @iterations.forEach =>
      lastAccount = null
      firstAccount = null
      @accounts.forEach (accountId) =>
        if lastAccount
          # fulfill the order from the last account
          delta = @engine.apply new Operation
            reference: 'hello'
            sequence: @nextSequence()
            timestamp: @nextTimestamp()
            account: accountId
            submit:
              bidCurrency: 'EUR'
              offerCurrency: 'BTC'
              offerPrice: new Amount '100'
              offerAmount: new Amount '50'
          if delta.result.trades
            @trades += delta.result.trades.length
        else
          # record this as the first account so we can complete the circle
          firstAccount = accountId

        # order some BTC
        delta = @engine.apply new Operation
          reference: 'hello'
          sequence: @nextSequence()
          timestamp: @nextTimestamp()
          account: accountId
          submit:
            bidCurrency: 'BTC'
            offerCurrency: 'EUR'
            bidPrice: new Amount '100'
            bidAmount: new Amount '50'
        if delta.result.trades
          @trades += delta.result.trades.length

        # set the last account
        lastAccount = accountId

      # now we can complete the circle and give the EUR back to the first account
      delta = @engine.apply new Operation
        reference: 'hello'
        sequence: @nextSequence()
        timestamp: @nextTimestamp()
        account: firstAccount
        submit:
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          offerPrice: new Amount '100'
          offerAmount: new Amount '50'          
      if delta.result.trades
        @trades += delta.result.trades.length

    @time = process.hrtime startTime
