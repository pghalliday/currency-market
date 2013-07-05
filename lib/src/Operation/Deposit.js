(function() {
  var Amount, Deposit;

  Amount = require('../Amount');

  module.exports = Deposit = (function() {
    function Deposit(params) {
      var exported;
      exported = params.exported;
      if (exported) {
        params = exported;
        params.amount = new Amount(exported.amount);
      }
      this.currency = params.currency || (function() {
        throw new Error('Must supply a currency');
      })();
      this.amount = params.amount || (function() {
        throw new Error('Must supply an amount');
      })();
    }

    return Deposit;

  })();

}).call(this);
