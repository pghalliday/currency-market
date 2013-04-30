RandomBidOffer = require './RandomBidOffer'

[1..10].forEach (iteration) ->  
  randomBidOffer = new RandomBidOffer
    iterations: iteration
    accounts: 1000
    price: 100
    spread: 5
    amount: 50

  randomBidOffer.execute()
  console.log randomBidOffer.trades + ' Trades'
  console.log randomBidOffer.trades / randomBidOffer.time[0] + ' Trades per second'
