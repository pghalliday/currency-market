# This test places random orders distributed around a fixed price, spread and amount
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

module.exports = class RandomBidOrder
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
        offerPrice = new Amount (price + spread) + ''
        offerAmount = new Amount (poisson params.amount) + ''
        bidPrice = new Amount price + ''
        bidAmount = new Amount (poisson params.amount) + ''
        requiredEUR = bidAmount.multiply bidPrice
        @randomParameters[accountId][iteration] = 
          offerPrice: offerPrice
          offerAmount: offerAmount
          bidPrice: bidPrice
          bidAmount: bidAmount
          requiredEUR: requiredEUR
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
          order: entries[id].order
      entries = @market.books['BTC']['EUR'].entries
      Object.keys(entries).forEach (id) =>
        @market.cancel
          id: nextTransactionId()
          timestamp: TIMESTAMP
          order: entries[id].order

      # withdraw funds, make deposits and place new orders
      @accounts.forEach (account) =>
        accountId = account.id
        parameters = @randomParameters[accountId][iteration]
        #
        # If you see an error then uncomment this to capture code to reproduce it
        #
        # console.log 'market.deposit'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  currency: \'EUR\''
        # console.log '  amount: new Amount \'' + parameters.requiredEUR + '\''
        # console.log 'market.deposit'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  currency: \'BTC\''
        # console.log '  amount: new Amount \'' + parameters.offerAmount + '\''
        # console.log 'market.submit new Order'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  bidCurrency: \'BTC\''
        # console.log '  offerCurrency: \'EUR\''
        # console.log '  bidPrice: new Amount \'' + parameters.bidPrice + '\''
        # console.log '  bidAmount: new Amount \'' + parameters.bidAmount + '\''
        # console.log 'market.submit new Order'
        # console.log '  id: \'' + nextTransactionId() + '\''
        # console.log '  timestamp: \'' + TIMESTAMP + '\''
        # console.log '  account: \'' + accountId + '\''
        # console.log '  bidCurrency: \'EUR\''
        # console.log '  offerCurrency: \'BTC\''
        # console.log '  offerPrice: new Amount \'' + parameters.offerPrice + '\''
        # console.log '  offerAmount: new Amount \'' + parameters.offerAmount + '\''
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
          amount: parameters.requiredEUR
        @market.deposit
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          currency: 'BTC'
          amount: parameters.offerAmount
        @market.submit new Order
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          bidCurrency: 'BTC'
          offerCurrency: 'EUR'
          bidPrice: parameters.bidPrice
          bidAmount: parameters.bidAmount
        @market.submit new Order
          id: nextTransactionId()
          timestamp: TIMESTAMP
          account: accountId
          bidCurrency: 'EUR'
          offerCurrency: 'BTC'
          offerPrice: parameters.offerPrice
          offerAmount: parameters.offerAmount

    @time = process.hrtime startTime
