(function() {
  var Account, Amount, Market, Order, RandomBidBid, TIMESTAMP, nextTransactionId, poisson, transactionId,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Market = require('../src/Market');

  Account = require('../src/Account');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  poisson = require('randgen').rpoisson;

  transactionId = 100000;

  nextTransactionId = function() {
    return transactionId++;
  };

  TIMESTAMP = '1366758222';

  module.exports = RandomBidBid = (function() {
    function RandomBidBid(params) {
      this.execute = __bind(this.execute, this);
      var _i, _j, _ref, _ref1, _results, _results1,
        _this = this;

      this.iterations = (function() {
        _results = [];
        for (var _i = 1, _ref = params.iterations; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      this.accounts = [];
      this.market = new Market({
        currencies: ['EUR', 'BTC']
      });
      this.randomParameters = Object.create(null);
      (function() {
        _results1 = [];
        for (var _j = 1, _ref1 = params.accounts; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 1 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this).forEach(function() {
        var accountId;

        accountId = nextTransactionId();
        _this.market.register(new Account({
          id: accountId,
          timestamp: TIMESTAMP,
          currencies: ['EUR', 'BTC']
        }));
        _this.randomParameters[accountId] = [];
        _this.iterations.forEach(function(iteration) {
          var bidAmount1, bidAmount2, bidPrice1, bidPrice2, offerPrice, price, requiredBTC, requiredEUR, spread;

          price = poisson(params.price);
          spread = poisson(params.spread);
          offerPrice = price + spread;
          bidPrice1 = new Amount((1 / offerPrice) + '');
          bidAmount1 = new Amount((offerPrice * (poisson(params.amount))) + '');
          requiredBTC = bidAmount1.multiply(bidPrice1);
          bidPrice2 = new Amount(price + '');
          bidAmount2 = new Amount((poisson(params.amount)) + '');
          requiredEUR = bidAmount2.multiply(bidPrice2);
          return _this.randomParameters[accountId][iteration] = {
            bidPrice1: bidPrice1,
            bidAmount1: bidAmount1,
            requiredBTC: requiredBTC,
            bidPrice2: bidPrice2,
            bidAmount2: bidAmount2,
            requiredEUR: requiredEUR
          };
        });
        return _this.accounts.push(_this.market.accounts[accountId]);
      });
      this.trades = 0;
      this.market.on('trade', function(trade) {
        return _this.trades++;
      });
      this.deposits = 0;
      this.market.on('deposit', function(deposit) {
        return _this.deposits++;
      });
      this.withdrawals = 0;
      this.market.on('withdrawal', function(withdrawal) {
        return _this.withdrawals++;
      });
      this.orders = 0;
      this.market.on('order', function(order) {
        return _this.orders++;
      });
      this.cancellations = 0;
      this.market.on('cancellation', function(cancellation) {
        return _this.cancellations++;
      });
    }

    RandomBidBid.prototype.execute = function() {
      var startTime,
        _this = this;

      startTime = process.hrtime();
      this.iterations.forEach(function(iteration) {
        var id, order, orders;

        orders = _this.market.orders;
        for (id in orders) {
          order = orders[id];
          _this.market.cancel({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            order: id
          });
        }
        return _this.accounts.forEach(function(account) {
          var accountId, parameters;

          accountId = account.id;
          parameters = _this.randomParameters[accountId][iteration];
          _this.market.withdraw({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'EUR',
            amount: account.balances['EUR'].funds
          });
          _this.market.withdraw({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'BTC',
            amount: account.balances['BTC'].funds
          });
          _this.market.deposit({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'EUR',
            amount: parameters.requiredEUR
          });
          _this.market.submit(new Order({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: parameters.bidPrice2,
            bidAmount: parameters.bidAmount2
          }));
          _this.market.deposit({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'BTC',
            amount: parameters.requiredBTC
          });
          return _this.market.submit(new Order({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            bidPrice: parameters.bidPrice1,
            bidAmount: parameters.bidAmount1
          }));
        });
      });
      return this.time = process.hrtime(startTime);
    };

    return RandomBidBid;

  })();

}).call(this);
