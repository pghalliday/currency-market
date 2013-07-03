(function() {
  var Account, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(account) {
      this.getBalance = __bind(this.getBalance, this);
      var balance, currency, _ref;
      this.balances = {};
      this.orders = {};
      if (account) {
        _ref = account.balances;
        for (currency in _ref) {
          balance = _ref[currency];
          this.balances[currency] = new Balance(balance);
        }
      }
    }

    Account.prototype.getBalance = function(currency) {
      return this.balances[currency] = this.balances[currency] || new Balance();
    };

    return Account;

  })();

}).call(this);
