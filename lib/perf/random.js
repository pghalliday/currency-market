(function() {
  var ACCOUNTS, AMOUNT, Account, Amount, ITERATIONS, Market, Order, PRICE, SPREAD, TIMESTAMP, accounts, cancellationCount, depositCount, elapsedTime, market, nextTransactionId, orderCount, poisson, randomParameters, startTime, tradeCount, transactionId, withdrawalCount, _i, _j, _results, _results1;

  ITERATIONS = 10000;

  ACCOUNTS = 10;

  PRICE = 100;

  SPREAD = 4;

  AMOUNT = 50;

  poisson = require('randgen').rpoisson;

  Market = require('../src/Market');

  Account = require('../src/Account');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  transactionId = 100000;

  nextTransactionId = function() {
    return transactionId++;
  };

  TIMESTAMP = '1366758222';

  market = new Market({
    currencies: ['EUR', 'BTC']
  });

  randomParameters = Object.create(null);

  (function() {
    _results = [];
    for (var _i = 1; 1 <= ACCOUNTS ? _i <= ACCOUNTS : _i >= ACCOUNTS; 1 <= ACCOUNTS ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function() {
    var id, _i, _results;

    id = nextTransactionId();
    market.register(new Account({
      id: id,
      timestamp: TIMESTAMP,
      currencies: ['EUR', 'BTC']
    }));
    randomParameters[id] = [];
    return (function() {
      _results = [];
      for (var _i = 1; 1 <= ITERATIONS ? _i <= ITERATIONS : _i >= ITERATIONS; 1 <= ITERATIONS ? _i++ : _i--){ _results.push(_i); }
      return _results;
    }).apply(this).forEach(function(iteration) {
      var bidAmount, bidPrice, offerAmount, offerPrice, price, requiredEUR, spread;

      price = poisson(PRICE);
      spread = poisson(SPREAD);
      offerPrice = new Amount((price + spread) + '');
      offerAmount = new Amount((poisson(AMOUNT)) + '');
      bidPrice = new Amount(price + '');
      bidAmount = new Amount((poisson(AMOUNT)) + '');
      requiredEUR = bidAmount.multiply(bidPrice);
      return randomParameters[id][iteration] = {
        offerPrice: offerPrice,
        offerAmount: offerAmount,
        bidPrice: bidPrice,
        bidAmount: bidAmount,
        requiredEUR: requiredEUR
      };
    });
  });

  startTime = process.hrtime();

  tradeCount = 0;

  market.on('trade', function(trade) {
    return tradeCount++;
  });

  depositCount = 0;

  market.on('deposit', function(deposit) {
    return depositCount++;
  });

  withdrawalCount = 0;

  market.on('withdrawal', function(withdrawal) {
    return withdrawalCount++;
  });

  orderCount = 0;

  market.on('order', function(order) {
    return orderCount++;
  });

  cancellationCount = 0;

  market.on('cancellation', function(cancellation) {
    return cancellationCount++;
  });

  accounts = market.accounts;

  (function() {
    _results1 = [];
    for (var _j = 1; 1 <= ITERATIONS ? _j <= ITERATIONS : _j >= ITERATIONS; 1 <= ITERATIONS ? _j++ : _j--){ _results1.push(_j); }
    return _results1;
  }).apply(this).forEach(function(iteration) {
    var entries;

    entries = market.books['EUR']['BTC'].entries;
    Object.keys(entries).forEach(function(id) {
      return market.cancel({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        order: entries[id].order
      });
    });
    entries = market.books['BTC']['EUR'].entries;
    Object.keys(entries).forEach(function(id) {
      return market.cancel({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        order: entries[id].order
      });
    });
    return Object.keys(accounts).forEach(function(accountId) {
      var parameters;

      parameters = randomParameters[accountId][iteration];
      console.log('market.deposit');
      console.log('  id: \'' + nextTransactionId() + '\'');
      console.log('  timestamp: \'' + TIMESTAMP + '\'');
      console.log('  account: \'' + accountId + '\'');
      console.log('  currency: \'EUR\'');
      console.log('  amount: new Amount \'' + parameters.requiredEUR + '\'');
      console.log('market.deposit');
      console.log('  id: \'' + nextTransactionId() + '\'');
      console.log('  timestamp: \'' + TIMESTAMP + '\'');
      console.log('  account: \'' + accountId + '\'');
      console.log('  currency: \'BTC\'');
      console.log('  amount: new Amount \'' + parameters.offerAmount + '\'');
      console.log('market.submit new Order');
      console.log('  id: \'' + nextTransactionId() + '\'');
      console.log('  timestamp: \'' + TIMESTAMP + '\'');
      console.log('  account: \'' + accountId + '\'');
      console.log('  bidCurrency: \'BTC\'');
      console.log('  offerCurrency: \'EUR\'');
      console.log('  bidPrice: new Amount \'' + parameters.bidPrice + '\'');
      console.log('  bidAmount: new Amount \'' + parameters.bidAmount + '\'');
      console.log('market.submit new Order');
      console.log('  id: \'' + nextTransactionId() + '\'');
      console.log('  timestamp: \'' + TIMESTAMP + '\'');
      console.log('  account: \'' + accountId + '\'');
      console.log('  bidCurrency: \'EUR\'');
      console.log('  offerCurrency: \'BTC\'');
      console.log('  offerPrice: new Amount \'' + parameters.offerPrice + '\'');
      console.log('  offerAmount: new Amount \'' + parameters.offerAmount + '\'');
      market.withdraw({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        currency: 'EUR',
        amount: accounts[accountId].balances['EUR'].funds
      });
      market.withdraw({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        currency: 'BTC',
        amount: accounts[accountId].balances['BTC'].funds
      });
      market.deposit({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        currency: 'EUR',
        amount: parameters.requiredEUR
      });
      market.deposit({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        currency: 'BTC',
        amount: parameters.offerAmount
      });
      market.submit(new Order({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        bidCurrency: 'BTC',
        offerCurrency: 'EUR',
        bidPrice: parameters.bidPrice,
        bidAmount: parameters.bidAmount
      }));
      return market.submit(new Order({
        id: nextTransactionId(),
        timestamp: TIMESTAMP,
        account: accountId,
        bidCurrency: 'EUR',
        offerCurrency: 'BTC',
        offerPrice: parameters.offerPrice,
        offerAmount: parameters.offerAmount
      }));
    });
  });

  elapsedTime = process.hrtime(startTime);

  console.log(tradeCount + ' trades executed in ' + elapsedTime);

  console.log(depositCount + ' deposits');

  console.log(withdrawalCount + ' withdrawals');

  console.log(orderCount + ' orders');

  console.log(cancellationCount + ' cancellations');

}).call(this);
