# This test places random orders distributed around a fixed price, spread and amount
# in each iteration all accounts cancel their previous orders refresh 
# balances (by withdrawing and depositing) and set new orders
# the number of trades may vary
ITERATIONS = 10000
ACCOUNTS = 10
PRICE = 100
SPREAD = 4
AMOUNT = 50

# randgen library gives me a poisson distribution function
poisson = require('randgen').rpoisson

# prepare test
Market = require '../src/Market'
Account = require '../src/Account'
Amount = require '../src/Amount'
Order = require '../src/Order'

transactionId = 100000
nextTransactionId = ->
  return transactionId++

TIMESTAMP = '1366758222'

market = new Market
  currencies: [
    'EUR'
    'BTC'
  ]

# create the accounts and the random parameters in advance
# so as not to skew the timings
# use a poisson distribution to generate positive 
# random parameters around the given means
randomParameters = Object.create null
[1..ACCOUNTS].forEach ->
  id = nextTransactionId()
  market.register new Account
    id: id
    timestamp: TIMESTAMP
    currencies: [
      'EUR'
      'BTC'
    ]
  randomParameters[id] = []
  [1..ITERATIONS].forEach (iteration) ->
    price = poisson PRICE
    spread = poisson SPREAD
    offerPrice = new Amount (price + spread) + ''
    offerAmount = new Amount (poisson AMOUNT) + ''
    bidPrice = new Amount price + ''
    bidAmount = new Amount (poisson AMOUNT) + ''
    requiredEUR = bidAmount.multiply bidPrice
    randomParameters[id][iteration] = 
      offerPrice: offerPrice
      offerAmount: offerAmount
      bidPrice: bidPrice
      bidAmount: bidAmount
      requiredEUR: requiredEUR

# perform test
startTime = process.hrtime()

tradeCount = 0
market.on 'trade', (trade) ->
  tradeCount++;

depositCount = 0
market.on 'deposit', (deposit) ->
  depositCount++;

withdrawalCount = 0
market.on 'withdrawal', (withdrawal) ->
  withdrawalCount++;

orderCount = 0
market.on 'order', (order) ->
  orderCount++;

cancellationCount = 0
market.on 'cancellation', (cancellation) ->
  cancellationCount++;

accounts = market.accounts
[1..ITERATIONS].forEach (iteration) ->
  # cancel all the outstanding orders
  entries = market.books['EUR']['BTC'].entries
  Object.keys(entries).forEach (id) ->
    market.cancel
      id: nextTransactionId()
      timestamp: TIMESTAMP
      order: entries[id].order
  entries = market.books['BTC']['EUR'].entries
  Object.keys(entries).forEach (id) ->
    market.cancel
      id: nextTransactionId()
      timestamp: TIMESTAMP
      order: entries[id].order

  # withdraw funds, make deposits and place new orders
  Object.keys(accounts).forEach (accountId) ->
    parameters = randomParameters[accountId][iteration]
    console.log accountId
    console.log accounts[accountId].balances['EUR'].funds.toString()
    console.log accounts[accountId].balances['EUR'].lockedFunds.toString()
    console.log accounts[accountId].balances['BTC'].funds.toString()
    console.log accounts[accountId].balances['BTC'].lockedFunds.toString()
    market.withdraw
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      currency: 'EUR'
      amount: accounts[accountId].balances['EUR'].funds
    market.withdraw
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      currency: 'BTC'
      amount: accounts[accountId].balances['BTC'].funds
    market.deposit
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      currency: 'EUR'
      amount: parameters.requiredEUR
    market.deposit
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      currency: 'BTC'
      amount: parameters.offerAmount
    market.submit new Order
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      bidCurrency: 'BTC'
      offerCurrency: 'EUR'
      bidPrice: parameters.bidPrice
      bidAmount: parameters.bidAmount
    market.submit new Order
      id: nextTransactionId()
      timestamp: TIMESTAMP
      account: accountId
      bidCurrency: 'EUR'
      offerCurrency: 'BTC'
      offerPrice: parameters.offerPrice
      offerAmount: parameters.offerAmount

elapsedTime = process.hrtime startTime
console.log tradeCount + ' trades executed in ' + elapsedTime
console.log depositCount + ' deposits'
console.log withdrawalCount + ' withdrawals'
console.log orderCount + ' orders'
console.log cancellationCount + ' cancellations'
