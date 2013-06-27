(function() {
  var RandomBidOffer, rate, _i, _results;

  RandomBidOffer = require('./RandomBidOffer');

  rate = function(count, time) {
    return (count * 1000000000) / ((time[0] * 1000000000) + time[1]);
  };

  (function() {
    _results = [];
    for (_i = 1; _i <= 50; _i++){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function(iteration) {
    var randomBidOffer;
    randomBidOffer = new RandomBidOffer({
      iterations: 2,
      accounts: 1000,
      price: 100,
      spread: 5,
      amount: 50
    });
    randomBidOffer.execute();
    console.log(randomBidOffer.trades + ' Trades');
    return console.log(rate(randomBidOffer.trades, randomBidOffer.time) + ' Trades per second');
  });

}).call(this);
