(function() {
  var PassItOn, RandomBidOrder, passItOn, randomBidOrder;

  PassItOn = require('./PassItOn');

  RandomBidOrder = require('./RandomBidOrder');

  passItOn = new PassItOn({
    iterations: 10000,
    accounts: 2
  });

  passItOn.execute();

  console.log(passItOn.trades / passItOn.time[0] + ' Trades per second');

  randomBidOrder = new RandomBidOrder({
    iterations: 10,
    accounts: 1000,
    price: 100,
    spread: 5,
    amount: 50
  });

  randomBidOrder.execute();

  console.log(randomBidOrder.trades / randomBidOrder.time[0] + ' Trades per second');

}).call(this);
