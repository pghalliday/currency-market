(function() {
  var RandomBidOffer;

  RandomBidOffer = require('./RandomBidOffer');

  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function(iteration) {
    var randomBidOffer;

    randomBidOffer = new RandomBidOffer({
      iterations: iteration,
      accounts: 1000,
      price: 100,
      spread: 5,
      amount: 50
    });
    randomBidOffer.execute();
    console.log(randomBidOffer.trades + ' Trades');
    return console.log(randomBidOffer.trades / randomBidOffer.time[0] + ' Trades per second');
  });

}).call(this);
