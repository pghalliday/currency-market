(function() {
  var Balance;

  module.exports = Balance = (function() {
    function Balance(params) {
      this.funds = '0';
      this.lockedFunds = '0';
      if (params) {
        this.funds = params.funds;
        this.lockedFunds = params.lockedFunds;
      }
    }

    return Balance;

  })();

}).call(this);
