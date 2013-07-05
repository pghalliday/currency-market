(function() {
  var Amount, Balance;

  Amount = require('../Amount');

  module.exports = Balance = (function() {
    function Balance(params) {
      this.funds = Amount.ZERO;
      this.lockedFunds = Amount.ZERO;
      if (params) {
        this.funds = new Amount(params.funds);
        this.lockedFunds = new Amount(params.lockedFunds);
      }
    }

    return Balance;

  })();

}).call(this);
