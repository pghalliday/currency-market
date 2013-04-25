(function() {
  var Account, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(params) {
      this["export"] = __bind(this["export"], this);
      this.equals = __bind(this.equals, this);
      var _this = this;

      this.balances = Object.create(null);
      if (typeof params.state === 'undefined') {
        this.id = params.id;
        params.currencies.forEach(function(currency) {
          return _this.balances[currency] = new Balance();
        });
      } else {
        this.id = params.state.id;
        Object.keys(params.state.balances).forEach(function(currency) {
          return _this.balances[currency] = new Balance({
            state: params.state.balances[currency]
          });
        });
      }
    }

    Account.prototype.equals = function(account) {
      var equal,
        _this = this;

      equal = true;
      if (this.id === account.id) {
        Object.keys(this.balances).forEach(function(currency) {
          if (typeof account.balances[currency] === 'undefined') {
            return equal = false;
          } else {
            if (!account.balances[currency].equals(_this.balances[currency])) {
              return equal = false;
            }
          }
        });
      } else {
        equal = false;
      }
      return equal;
    };

    Account.prototype["export"] = function() {
      var state,
        _this = this;

      state = Object.create(null);
      state.id = this.id;
      state.balances = Object.create(null);
      Object.keys(this.balances).forEach(function(currency) {
        return state.balances[currency] = _this.balances[currency]["export"]();
      });
      return state;
    };

    return Account;

  })();

}).call(this);
