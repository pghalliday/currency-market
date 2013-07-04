(function() {
  var Deposit;

  module.exports = Deposit = (function() {
    function Deposit(params) {
      this.currency = params.currency || (function() {
        throw new Error('Must supply a currency');
      })();
      this.amount = params.amount || (function() {
        throw new Error('Must supply an amount');
      })();
    }

    return Deposit;

  })();

}).call(this);
