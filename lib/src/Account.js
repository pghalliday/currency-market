(function() {
  var Account, Amount, Balance, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  Order = require('./Order');

  Amount = require('./Amount');

  module.exports = Account = (function() {
    function Account(params) {
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.equals = __bind(this.equals, this);
      this["export"] = __bind(this["export"], this);
      var _this = this;

      this.balances = Object.create(null);
      this.orders = Object.create(null);
      if (typeof params.state === 'undefined') {
        if (typeof params.id === 'undefined') {
          throw new Error('Must supply transaction ID');
        } else {
          if (typeof params.timestamp === 'undefined') {
            throw new Error('Must supply timestamp');
          } else {
            if (typeof params.currencies === 'undefined') {
              throw new Error('Must supply currencies');
            } else {
              this.id = params.id;
              this.timestamp = params.timestamp;
              params.currencies.forEach(function(currency) {
                return _this.balances[currency] = new Balance();
              });
            }
          }
        }
      } else {
        this.id = params.state.id;
        this.timestamp = params.state.timestamp;
        Object.keys(params.state.balances).forEach(function(currency) {
          return _this.balances[currency] = new Balance({
            state: params.state.balances[currency]
          });
        });
        params.state.orders.forEach(function(orderId) {
          return _this.orders[orderId] = params.orders[orderId];
        });
      }
    }

    Account.prototype["export"] = function() {
      var state,
        _this = this;

      state = Object.create(null);
      state.id = this.id;
      state.timestamp = this.timestamp;
      state.balances = Object.create(null);
      Object.keys(this.balances).forEach(function(currency) {
        return state.balances[currency] = _this.balances[currency]["export"]();
      });
      state.orders = [];
      Object.keys(this.orders).forEach(function(orderId) {
        return state.orders.push(orderId);
      });
      return state;
    };

    Account.prototype.equals = function(account) {
      var equal,
        _this = this;

      equal = true;
      if (this.id === account.id) {
        if (this.timestamp === account.timestamp) {
          Object.keys(this.balances).forEach(function(currency) {
            if (typeof account.balances[currency] === 'undefined') {
              return equal = false;
            } else {
              if (!account.balances[currency].equals(_this.balances[currency])) {
                return equal = false;
              }
            }
          });
          if (equal) {
            Object.keys(this.orders).forEach(function(id) {
              if (account.orders[id]) {
                if (!(_this.orders[id].equals(account.orders[id]))) {
                  return equal = false;
                }
              } else {
                return equal = false;
              }
            });
            if (equal) {
              Object.keys(account.orders).forEach(function(id) {
                if (!_this.orders[id]) {
                  return equal = false;
                }
              });
            }
          }
        } else {
          equal = false;
        }
      } else {
        equal = false;
      }
      return equal;
    };

    Account.prototype.submit = function(order) {
      var _this = this;

      this.balances[order.offerCurrency].lock(order.offerAmount);
      this.orders[order.id] = order;
      order.on('fill', function(fill) {
        _this.balances[order.offerCurrency].unlock(fill.fundsUnlocked);
        _this.balances[order.offerCurrency].withdraw(fill.offerAmount);
        return _this.balances[order.bidCurrency].deposit(fill.bidAmount);
      });
      return order.on('done', function() {
        return delete _this.orders[order.id];
      });
    };

    Account.prototype.cancel = function(order) {
      delete this.orders[order.id];
      return this.balances[order.offerCurrency].unlock(order.offerAmount);
    };

    return Account;

  })();

}).call(this);
