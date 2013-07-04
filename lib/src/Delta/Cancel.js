(function() {
  var Amount, Cancel;

  Amount = require('../Amount');

  module.exports = Cancel = (function() {
    function Cancel(params) {
      var exported;

      exported = params.exported;
      if (exported) {
        params = exported;
        params.lockedFunds = new Amount(params.lockedFunds);
      }
      this.lockedFunds = params.lockedFunds;
    }

    return Cancel;

  })();

}).call(this);
