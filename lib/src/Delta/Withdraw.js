(function() {
  var Amount, Withdraw;

  Amount = require('../Amount');

  module.exports = Withdraw = (function() {
    function Withdraw(params) {
      var exported;

      exported = params.exported;
      if (exported) {
        params = exported;
        params.funds = new Amount(params.funds);
      }
      this.funds = params.funds;
    }

    return Withdraw;

  })();

}).call(this);
