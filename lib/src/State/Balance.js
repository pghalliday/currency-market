(function() {
  var Balance;

  module.exports = Balance = (function() {
    function Balance(params) {
      if (params) {
        this.funds = params.funds;
        this.lockedFunds = params.lockedFunds;
      } else {
        this.funds = '0';
        this.lockedFunds = '0';
      }
    }

    return Balance;

  })();

}).call(this);
