(function() {
  var Account, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(params) {
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      var _this = this;

      this.balances = Object.create(null);
      if (params.id) {
        if (params.timestamp) {
          if (params.currencies) {
            this.id = params.id;
            this.timestamp = params.timestamp;
            params.currencies.forEach(function(currency) {
              return _this.balances[currency] = new Balance();
            });
          } else {
            throw new Error('Must supply currencies');
          }
        } else {
          throw new Error('Must supply timestamp');
        }
      } else {
        throw new Error('Must supply transaction ID');
      }
    }

    Account.prototype.submit = function(order) {
      this.balances[order.offerCurrency].submitOffer(order);
      return this.balances[order.bidCurrency].submitBid(order);
    };

    Account.prototype.cancel = function(order) {
      return this.balances[order.offerCurrency].cancel(order);
    };

    return Account;

  })();

}).call(this);
