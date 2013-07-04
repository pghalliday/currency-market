(function() {
  var Withdraw;

  module.exports = Withdraw = (function() {
    function Withdraw(params) {
      this.currency = params.currency || (function() {
        throw new Error('Must supply a currency');
      })();
      this.amount = params.amount || (function() {
        throw new Error('Must supply an amount');
      })();
    }

    return Withdraw;

  })();

}).call(this);
