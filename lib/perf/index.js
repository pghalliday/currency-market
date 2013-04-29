(function() {
  var PassItOn, RandomBidBid, RandomBidOffer, RandomOfferOffer, randomOfferOffer;

  PassItOn = require('./PassItOn');

  RandomBidOffer = require('./RandomBidOffer');

  RandomBidBid = require('./RandomBidBid');

  RandomOfferOffer = require('./RandomOfferOffer');

  randomOfferOffer = new RandomOfferOffer({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomOfferOffer.execute();

  console.log(randomOfferOffer.trades + ' Trades');

  console.log(randomOfferOffer.trades / randomOfferOffer.time[0] + ' Trades per second');

}).call(this);
