(function() {
  var Submit;

  module.exports = Submit = (function() {
    function Submit(params) {
      this.lockedFunds = params.lockedFunds;
      this.nextHigherOrderSequence = params.nextHigherOrderSequence;
      this.trades = params.trades;
    }

    return Submit;

  })();

}).call(this);
