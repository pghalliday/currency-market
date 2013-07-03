(function() {
  var Account, Balance, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  Order = require('./Order');

  module.exports = Account = (function() {
    function Account(params) {
      this["export"] = __bind(this["export"], this);
      this.cancel = __bind(this.cancel, this);
      this.getOrder = __bind(this.getOrder, this);
      this.complete = __bind(this.complete, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.getBalance = __bind(this.getBalance, this);
      this.orders = {};
      if (params && params.id) {
        this.id = params.id;
        this.commission = params.commission;
        this.balances = {};
      } else {
        throw new Error('Account ID must be specified');
      }
    }

    Account.prototype.getBalance = function(currency) {
      if (!this.balances[currency]) {
        this.balances[currency] = new Balance({
          account: this,
          currency: currency,
          commission: this.commission
        });
      }
      return this.balances[currency];
    };

    Account.prototype.deposit = function(params) {
      if (params.currency) {
        if (params.amount) {
          return this.getBalance(params.currency).deposit(params.amount);
        } else {
          throw new Error('Must supply an amount');
        }
      } else {
        throw new Error('Must supply a currency');
      }
    };

    Account.prototype.withdraw = function(params) {
      if (params.currency) {
        if (params.amount) {
          return this.getBalance(params.currency).withdraw(params.amount);
        } else {
          throw new Error('Must supply an amount');
        }
      } else {
        throw new Error('Must supply a currency');
      }
    };

    Account.prototype.submit = function(order) {
      var lockedFunds;
      lockedFunds = this.getBalance(order.book.offerCurrency).lock(order.offerAmount);
      this.orders[order.sequence] = order;
      return lockedFunds;
    };

    Account.prototype.complete = function(order) {
      return delete this.orders[order.sequence];
    };

    Account.prototype.getOrder = function(sequence) {
      var order;
      order = this.orders[sequence];
      if (!order) {
        throw new Error('Order cannot be found');
      } else {
        return order;
      }
    };

    Account.prototype.cancel = function(order) {
      delete this.orders[order.sequence];
      return this.getBalance(order.book.offerCurrency).unlock(order.offerAmount);
    };

    Account.prototype["export"] = function() {
      var balance, currency, object, _ref;
      object = {};
      object.id = this.id;
      object.balances = {};
      _ref = this.balances;
      for (currency in _ref) {
        balance = _ref[currency];
        object.balances[currency] = balance["export"]();
      }
      return object;
    };

    return Account;

  })();

}).call(this);
