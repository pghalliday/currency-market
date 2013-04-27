(function() {
  var Account, Amount, ITERATIONS, Market, Order, TIMESTAMP, accountId1, accountId2, elapsedTime, market, nextTransactionId, startTime, tradeCount, transactionId, _i, _results;

  ITERATIONS = 10000;

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

  accountId1 = nextTransactionId();

  market.register(new Account({
    id: accountId1,
    timestamp: TIMESTAMP,
    currencies: ['EUR', 'BTC']
  }));

  accountId2 = nextTransactionId();

  market.register(new Account({
    id: accountId2,
    timestamp: TIMESTAMP,
    currencies: ['EUR', 'BTC']
  }));

  market.deposit({
    id: nextTransactionId(),
    timestamp: TIMESTAMP,
    account: accountId1,
    currency: 'EUR',
    amount: new Amount('5000')
  });

  market.deposit({
    id: nextTransactionId(),
    timestamp: TIMESTAMP,
    account: accountId2,
    currency: 'BTC',
    amount: new Amount('50')
  });

  startTime = process.hrtime();

  tradeCount = 0;

  market.on('trade', function(trade) {
    return tradeCount++;
  });

  (function() {
    _results = [];
    for (var _i = 1; 1 <= ITERATIONS ? _i <= ITERATIONS : _i >= ITERATIONS; 1 <= ITERATIONS ? _i++ : _i--){ _results.push(_i); }
    return _results;
  }).apply(this).forEach(function(iteration) {
    market.submit(new Order({
      id: nextTransactionId(),
      timestamp: TIMESTAMP,
      account: accountId1,
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidPrice: new Amount('100'),
      bidAmount: new Amount('50')
    }));
    market.submit(new Order({
      id: nextTransactionId(),
      timestamp: TIMESTAMP,
      account: accountId2,
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerPrice: new Amount('100'),
      offerAmount: new Amount('50')
    }));
    market.submit(new Order({
      id: nextTransactionId(),
      timestamp: TIMESTAMP,
      account: accountId2,
      bidCurrency: 'BTC',
      offerCurrency: 'EUR',
      bidPrice: new Amount('100'),
      bidAmount: new Amount('50')
    }));
    return market.submit(new Order({
      id: nextTransactionId(),
      timestamp: TIMESTAMP,
      account: accountId1,
      bidCurrency: 'EUR',
      offerCurrency: 'BTC',
      offerPrice: new Amount('100'),
      offerAmount: new Amount('50')
    }));
  });

  elapsedTime = process.hrtime(startTime);

  console.log(tradeCount + ' trades executed in ' + elapsedTime);

}).call(this);
