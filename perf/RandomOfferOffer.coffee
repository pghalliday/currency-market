# This test places random offer orders distributed around a fixed price, spread and amount
# in each iteration all accounts cancel their previous orders refresh 
# balances (by withdrawing and depositing) and set new orders
# the number of trades may vary

Market = require '../src/Market'
Account = require '../src/Account'
Amount = require '../src/Amount'
Order = require '../src/Order'

# randgen library gives me a poisson distribution function
poisson = require('randgen').rpoisson

transactionId = 100000
nextTransactionId = ->
  return transactionId++

TIMESTAMP = '1366758222'

module.exports = class RandomOfferOffer
  constructor: (params) ->
    @iterations = [1..params.iterations]
    @accounts = []
    @market = new Market
      currencies: [
        'EUR'
        'BTC'
      ]

    # create the accounts and the random parameters in advance
    # so as not to skew the timings
    # use a poisson distribution to generate positive 
    # random parameters around the given means
    @randomParameters = Object.create null
    [1..params.accounts].forEach =>
      accountId = nextTransactionId()
      @market.register new Account
        id: accountId
        timestamp: TIMESTAMP
        currencies: [
          'EUR'
          'BTC'
        ]
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
      @accounts.push @market.accounts[accountId]

    @trades = 0
    @market.on 'trade', (trade) =>
      @trades++

    @deposits = 0
    @market.on 'deposit', (deposit) =>
      @deposits++

    @withdrawals = 0
    @market.on 'withdrawal', (withdrawal) =>
      @withdrawals++

    @orders = 0
    @market.on 'order', (order) =>
      @orders++

    @cancellations = 0
    @market.on 'cancellation', (cancellation) =>
      @cancellations++

  execute: =>
    startTime = process.hrtime()
    @iterations.forEach (iteration) =>
      # cancel all the outstanding orders
      entries = @market.books['EUR']['BTC'].entries
      Object.keys(entries).forEach (id) =>
        @market.cancel
          id: nextTransactionId()
          timestamp: TIMESTAMP
          order: id
      entries = @market.books['BTC']['EUR'].entries
      Object.keys(entries).forEach (id) =>
        @market.cancel
          id: nextTransactionId()
          timestamp: TIMESTAMP
          order: id

      # withdraw funds, make deposits and place new orders
      @accounts.forEach (account) =>
        accountId = account.id
        parameters = @randomParameters[accountId][iteration]
        #
        # If you see an error then uncomment this to capture code to reproduce it
        #
        # console.log '@market.deposit'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  currency: \'EUR\''
        # console.log '  amount: new Amount \'' + parameters.offerAmount1 + '\''
        # console.log '@market.submit new Order'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  bidCurrency: \'BTC\''
        # console.log '  offerCurrency: \'EUR\''
        # console.log '  offerPrice: new Amount \'' + parameters.offerPrice1 + '\''
        # console.log '  offerAmount: new Amount \'' + parameters.offerAmount1 + '\''
        # console.log '@market.deposit'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  currency: \'BTC\''
        # console.log '  amount: new Amount \'' + parameters.offerAmount2 + '\''
        # console.log '@market.submit new Order'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  bidCurrency: \'EUR\''
        # console.log '  offerCurrency: \'BTC\''
        # console.log '  offerPrice: new Amount \'' + parameters.offerPrice2 + '\''
        # console.log '  offerAmount: new Amount \'' + parameters.offerAmount2 + '\''
        #
        @market.withdraw
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'EUR'
          amount: account.balances['EUR'].funds
        @market.withdraw
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'BTC'
          amount: account.balances['BTC'].funds
        @market.deposit
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'EUR'
          amount: parameters.offerAmount1
        @market.submit new Order
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          offerPrice: parameters.offerPrice1
          offerAmount: parameters.offerAmount1
        @market.deposit
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'BTC'
          amount: parameters.offerAmount2
        @market.submit new Order
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          offerPrice: parameters.offerPrice2
          offerAmount: parameters.offerAmount2

    @time = process.hrtime startTime
