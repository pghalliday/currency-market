RandomBidOffer = require './RandomBidOffer'

rate = (count, time) ->
  (count * 1000000000) / ((time[0] * 1000000000) + time[1])

[1..50].forEach (iteration) ->  
  randomBidOffer = new RandomBidOffer
    iterations: 2
    accounts: 1000
    price: 100
    spread: 5
    amount: 50

  randomBidOffer.execute()
  console.log randomBidOffer.trades + ' Trades'
  console.log rate(randomBidOffer.trades, randomBidOffer.time) + ' Trades per second'
