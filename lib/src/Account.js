(function() {
  var Account, Balance;

  Balance = require('./Balance');

  module.exports = Account = (function() {
    function Account(params) {
      var _this = this;

      this.id = params.id;
      this.balances = Object.create(null);
      params.currencies.forEach(function(currency) {
        return _this.balances[currency] = new Balance();
      });
    }

    return Account;

  })();

}).call(this);
