(function() {
  var PassItOn, RandomBidBid, RandomBidOffer, RandomOfferOffer, passItOn, randomBidBid, randomBidOffer, randomOfferOffer, rate;

  PassItOn = require('./PassItOn');

  RandomBidOffer = require('./RandomBidOffer');

  RandomBidBid = require('./RandomBidBid');

  RandomOfferOffer = require('./RandomOfferOffer');

  rate = function(count, time) {
    return (count * 1000000000) / ((time[0] * 1000000000) + time[1]);
  };

  passItOn = new PassItOn({
    iterations: 10000,
    accounts: 2
  });

  passItOn.execute();

  console.log(passItOn.trades + ' Trades');

  console.log(rate(passItOn.trades, passItOn.time) + ' Trades per second');

  randomBidOffer = new RandomBidOffer({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomBidOffer.execute();

  console.log(randomBidOffer.trades + ' Trades');

  console.log(rate(randomBidOffer.trades, randomBidOffer.time) + ' Trades per second');

  randomOfferOffer = new RandomOfferOffer({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomOfferOffer.execute();

  console.log(randomOfferOffer.trades + ' Trades');

  console.log(rate(randomOfferOffer.trades, randomOfferOffer.time) + ' Trades per second');

  randomBidBid = new RandomBidBid({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomBidBid.execute();

  console.log(randomBidBid.trades + ' Trades');

  console.log(rate(randomBidBid.trades, randomBidBid.time) + ' Trades per second');

}).call(this);
