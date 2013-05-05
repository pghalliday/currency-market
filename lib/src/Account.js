(function() {
  var Account, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(id) {
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.getBalance = __bind(this.getBalance, this);      this.id = id;
      this.balances = Object.create(null);
    }

    Account.prototype.getBalance = function(currency) {
      if (!this.balances[currency]) {
        this.balances[currency] = new Balance();
      }
      return this.balances[currency];
    };

    Account.prototype.deposit = function(params) {
      return this.getBalance(params.currency).deposit(params.amount);
    };

    Account.prototype.withdraw = function(params) {
      return this.getBalance(params.currency).withdraw(params.amount);
    };

    Account.prototype.submit = function(order) {
      this.getBalance(order.offerCurrency).submitOffer(order);
      return this.getBalance(order.bidCurrency).submitBid(order);
    };

    Account.prototype.cancel = function(order) {
      return this.getBalance(order.offerCurrency).cancel(order);
    };

    return Account;

  })();

}).call(this);
