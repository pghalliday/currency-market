(function() {
  var Operation;

  module.exports = Operation = (function() {
    function Operation(params) {
      this.reference = params.reference;
      this.sequence = params.sequence;
      if (typeof this.sequence === 'undefined') {
        throw new Error('Must supply a sequence number');
      }
      this.timestamp = params.timestamp;
      if (typeof this.timestamp === 'undefined') {
        throw new Error('Must supply a timestamp');
      }
      this.account = params.account || (function() {
        throw new Error('Must supply an account ID');
      })();
      this.deposit = params.deposit;
      this.withdraw = params.withdraw;
      this.submit = params.submit;
      this.cancel = params.cancel;
      if (this.deposit) {

      } else if (this.withdraw) {

      } else if (this.submit) {

      } else if (this.cancel) {

      } else {
        throw new Error('Unknown operation');
      }
    }

    return Operation;

  })();

}).call(this);
