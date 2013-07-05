(function() {
  var Amount, Withdraw;

  Amount = require('../Amount');

  module.exports = Withdraw = (function() {
    function Withdraw(params) {
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

    return Withdraw;

  })();

}).call(this);
