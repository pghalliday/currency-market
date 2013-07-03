(function() {
  var SubmitDelta;

  module.exports = SubmitDelta = (function() {
    function SubmitDelta(params) {
      this.lockedFunds = params.lockedFunds;
      this.nextHigherOrderSequence = params.nextHigherOrderSequence;
      this.trades = params.trades;
    }

    return SubmitDelta;

  })();

}).call(this);
