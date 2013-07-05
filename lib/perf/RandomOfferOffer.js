(function() {
  var Account, Amount, Market, Order, RandomOfferOffer, TIMESTAMP, nextTransactionId, poisson, transactionId,
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

  module.exports = RandomOfferOffer = (function() {
    function RandomOfferOffer(params) {
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
        _this.randomParameters[accountId] = [];
        _this.iterations.forEach(function(iteration) {
          var offerAmount1, offerAmount2, offerPrice, offerPrice1, offerPrice2, price, spread;
          price = poisson(params.price);
          spread = poisson(params.spread);
          offerPrice = price + spread;
          offerPrice1 = new Amount(offerPrice + '');
          offerAmount1 = new Amount((poisson(params.amount)) + '');
          offerPrice2 = new Amount((1 / price) + '');
          offerAmount2 = new Amount((price * (poisson(params.amount))) + '');
          return _this.randomParameters[accountId][iteration] = {
            offerPrice1: offerPrice1,
            offerAmount1: offerAmount1,
            offerPrice2: offerPrice2,
            offerAmount2: offerAmount2
          };
        });
        return _this.accounts.push(_this.market.getAccount(accountId));
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

    RandomOfferOffer.prototype.execute = function() {
      var startTime,
        _this = this;
      startTime = process.hrtime();
      this.iterations.forEach(function(iteration) {
        _this.accounts.forEach(function(account) {
          var btcOffers, eurOffers, id, order, _results;
          eurOffers = account.getBalance('EUR').offers;
          btcOffers = account.getBalance('BTC').offers;
          for (id in eurOffers) {
            order = eurOffers[id];
            _this.market.cancel({
              id: nextTransactionId(),
              timestamp: TIMESTAMP,
              order: order
            });
          }
          _results = [];
          for (id in btcOffers) {
            order = btcOffers[id];
            _results.push(_this.market.cancel({
              id: nextTransactionId(),
              timestamp: TIMESTAMP,
              order: order
            }));
          }
          return _results;
        });
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
            amount: parameters.offerAmount1
          });
          _this.market.submit(new Order({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            offerPrice: parameters.offerPrice1,
            offerAmount: parameters.offerAmount1
          }));
          _this.market.deposit({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'BTC',
            amount: parameters.offerAmount2
          });
          return _this.market.submit(new Order({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            bidCurrency: 'EUR',
            offerCurrency: 'BTC',
            offerPrice: parameters.offerPrice2,
            offerAmount: parameters.offerAmount2
          }));
        });
      });
      return this.time = process.hrtime(startTime);
    };

    return RandomOfferOffer;

  })();

}).call(this);
