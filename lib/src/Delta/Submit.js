(function() {
  var Amount, Submit;

  Amount = require('../Amount');

  module.exports = Submit = (function() {
    function Submit(params) {
      var exported;

      exported = params.exported;
      if (exported) {
        params = exported;
        params.lockedFunds = new Amount(params.lockedFunds);
      }
      this.lockedFunds = params.lockedFunds;
      this.nextHigherOrderSequence = params.nextHigherOrderSequence;
      this.trades = params.trades;
    }

    return Submit;

  })();

}).call(this);
