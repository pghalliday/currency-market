(function() {
  var SubmitResult;

  module.exports = SubmitResult = (function() {
    function SubmitResult(params) {
      this.lockedFunds = params.lockedFunds;
      this.nextHigherOrderSequence = params.nextHigherOrderSequence;
      this.trades = params.trades;
    }

    return SubmitResult;

  })();

}).call(this);
