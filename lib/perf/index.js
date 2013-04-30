(function() {
  var PassItOn, RandomBidBid, RandomBidOffer, RandomOfferOffer, randomBidBid;

  PassItOn = require('./PassItOn');

  RandomBidOffer = require('./RandomBidOffer');

  RandomBidBid = require('./RandomBidBid');

  RandomOfferOffer = require('./RandomOfferOffer');

  randomBidBid = new RandomBidBid({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomBidBid.execute();

  console.log(randomBidBid.trades + ' Trades');

  console.log(randomBidBid.trades / randomBidBid.time[0] + ' Trades per second');

}).call(this);
