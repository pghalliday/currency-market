(function() {
  var Amount, Deposit;

  Amount = require('../Amount');

  module.exports = Deposit = (function() {
    function Deposit(params) {
      var exported;
      exported = params.exported;
      if (exported) {
        params = exported;
        params.funds = new Amount(params.funds);
      }
      this.funds = params.funds;
    }

    return Deposit;

  })();

}).call(this);
