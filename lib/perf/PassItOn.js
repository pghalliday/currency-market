(function() {
  var Account, Amount, Market, Order, PassItOn, TIMESTAMP, nextTransactionId, transactionId,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Market = require('../src/Market');

  Account = require('../src/Account');

  Amount = require('../src/Amount');

  Order = require('../src/Order');

  transactionId = 100000;

  nextTransactionId = function() {
    return transactionId++;
  };

  TIMESTAMP = '1366758222';

  module.exports = PassItOn = (function() {
    function PassItOn(params) {
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
      (function() {
        _results1 = [];
        for (var _j = 1, _ref1 = params.accounts; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; 1 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this).forEach(function(index) {
        var accountId;

        accountId = nextTransactionId();
        _this.market.register(new Account({
          id: accountId,
          timestamp: TIMESTAMP,
          currencies: ['EUR', 'BTC']
        }));
        if (index === 1) {
          _this.market.deposit({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'EUR',
            amount: new Amount('5000')
          });
        } else {
          _this.market.deposit({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: accountId,
            currency: 'BTC',
            amount: new Amount('50')
          });
        }
        return _this.accounts.push(_this.market.accounts[accountId]);
      });
      this.trades = 0;
      this.market.on('trade', function(trade) {
        return _this.trades++;
      });
    }

    PassItOn.prototype.execute = function() {
      var startTime,
        _this = this;

      startTime = process.hrtime();
      this.iterations.forEach(function() {
        var firstAccount, lastAccount;

        lastAccount = null;
        firstAccount = null;
        _this.accounts.forEach(function(account) {
          if (lastAccount) {
            _this.market.submit(new Order({
              id: nextTransactionId(),
              timestamp: TIMESTAMP,
              account: account.id,
              bidCurrency: 'EUR',
              offerCurrency: 'BTC',
              offerPrice: new Amount('100'),
              offerAmount: new Amount('50')
            }));
          } else {
            firstAccount = account;
          }
          _this.market.submit(new Order({
            id: nextTransactionId(),
            timestamp: TIMESTAMP,
            account: account.id,
            bidCurrency: 'BTC',
            offerCurrency: 'EUR',
            bidPrice: new Amount('100'),
            bidAmount: new Amount('50')
          }));
          return lastAccount = account;
        });
        return _this.market.submit(new Order({
          id: nextTransactionId(),
          timestamp: TIMESTAMP,
          account: firstAccount.id,
          bidCurrency: 'EUR',
          offerCurrency: 'BTC',
          offerPrice: new Amount('100'),
          offerAmount: new Amount('50')
        }));
      });
      return this.time = process.hrtime(startTime);
    };

    return PassItOn;

  })();

}).call(this);
