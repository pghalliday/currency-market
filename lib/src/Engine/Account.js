(function() {
  var Account, Balance, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  Order = require('./Order');

  module.exports = Account = (function() {
    function Account(params) {
      this["export"] = __bind(this["export"], this);
      this.cancel = __bind(this.cancel, this);
      this.complete = __bind(this.complete, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.getBalance = __bind(this.getBalance, this);
      this.orders = Object.create(null);
      if (params && params.id) {
        this.id = params.id;
        this.commission = params.commission;
        this.balances = Object.create(null);
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
      this.getBalance(order.book.offerCurrency).lock(order.offerAmount);
      return this.orders[order.sequence] = order;
    };

    Account.prototype.complete = function(order) {
      return delete this.orders[order.sequence];
    };

    Account.prototype.cancel = function(sequence) {
      var order;
      order = this.orders[sequence];
      if (order) {
        this.getBalance(order.offerBalance.currency).unlock(order.offerAmount);
        delete this.orders[sequence];
        return order;
      } else {
        throw new Error('Order cannot be found');
      }
    };

    Account.prototype["export"] = function() {
      var balance, currency, object, _ref;
      object = Object.create(null);
      object.id = this.id;
      object.balances = Object.create(null);
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
