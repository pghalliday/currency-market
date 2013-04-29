PassItOn = require './PassItOn'
RandomBidOffer = require './RandomBidOffer'
RandomBidBid = require './RandomBidBid'
RandomOfferOffer = require './RandomOfferOffer'

passItOn = new PassItOn
  iterations: 10000
  accounts: 2

passItOn.execute()
console.log passItOn.trades + ' Trades'
console.log passItOn.trades / passItOn.time[0] + ' Trades per second'

randomBidOffer = new RandomBidOffer
  iterations: 10
  accounts: 1000
  price: 100
  spread: 5
  amount: 50

randomBidOffer.execute()
console.log randomBidOffer.trades + ' Trades'
console.log randomBidOffer.trades / randomBidOffer.time[0] + ' Trades per second'

randomOfferOffer = new RandomOfferOffer
  iterations: 10
  accounts: 1000
  price: 100
  spread: 5
  amount: 50

randomOfferOffer.execute()
console.log randomOfferOffer.trades + ' Trades'
console.log randomOfferOffer.trades / randomOfferOffer.time[0] + ' Trades per second'

randomBidBid = new RandomBidBid
  iterations: 10
  accounts: 1000
  price: 100
  spread: 5
  amount: 50

randomBidBid.execute()
console.log randomBidBid.trades + ' Trades'
console.log randomBidBid.trades / randomBidBid.time[0] + ' Trades per second'
