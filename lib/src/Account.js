(function() {
  var Account, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(params) {
      this.equals = __bind(this.equals, this);
      this["export"] = __bind(this["export"], this);
      var _this = this;

      this.balances = Object.create(null);
      if (typeof params.state === 'undefined') {
        if (typeof params.id === 'undefined') {
          throw new Error('Must supply transaction ID');
        } else {
          if (typeof params.timestamp === 'undefined') {
            throw new Error('Must supply timestamp');
          } else {
            if (typeof params.key === 'undefined') {
              throw new Error('Must supply key');
            } else {
              if (typeof params.currencies === 'undefined') {
                throw new Error('Must supply currencies');
              } else {
                this.id = params.id;
                this.timestamp = params.timestamp;
                this.key = params.key;
                params.currencies.forEach(function(currency) {
                  return _this.balances[currency] = new Balance();
                });
              }
            }
          }
        }
      } else {
        this.id = params.state.id;
        this.timestamp = params.state.timestamp;
        this.key = params.state.key;
        Object.keys(params.state.balances).forEach(function(currency) {
          return _this.balances[currency] = new Balance({
            state: params.state.balances[currency]
          });
        });
      }
    }

    Account.prototype["export"] = function() {
      var state,
        _this = this;

      state = Object.create(null);
      state.id = this.id;
      state.timestamp = this.timestamp;
      state.key = this.key;
      state.balances = Object.create(null);
      Object.keys(this.balances).forEach(function(currency) {
        return state.balances[currency] = _this.balances[currency]["export"]();
      });
      return state;
    };

    Account.prototype.equals = function(account) {
      var equal,
        _this = this;

      equal = true;
      if (this.id === account.id) {
        if (this.timestamp === account.timestamp) {
          if (this.key === account.key) {
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
        } else {
          equal = false;
        }
      } else {
        equal = false;
      }
      return equal;
    };

    return Account;

  })();

}).call(this);
