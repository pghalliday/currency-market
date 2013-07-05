(function() {
  var Cancel, Delta, Deposit, Operation, Submit, Withdraw;

  Deposit = require('./Deposit');

  Withdraw = require('./Withdraw');

  Submit = require('./Submit');

  Cancel = require('./Cancel');

  Operation = require('../Operation');

  module.exports = Delta = (function() {
    function Delta(params) {
      var result;
      if (params.json) {
        params = JSON.parse(params.json);
        params.result = {
          exported: params.result
        };
        params.operation = new Operation({
          exported: params.operation
        });
      }
      this.sequence = params.sequence;
      if (typeof this.sequence === 'undefined') {
        throw new Error('Must supply a sequence number');
      }
      this.operation = params.operation || (function() {
        throw new Error('Must supply an operation');
      })();
      result = params.result;
      if (result) {
        if (this.operation.deposit) {
          this.result = new Deposit(result);
        } else if (this.operation.withdraw) {
          this.result = new Withdraw(result);
        } else if (this.operation.submit) {
          this.result = new Submit(result);
        } else if (this.operation.cancel) {
          this.result = new Cancel(result);
        } else {
          throw new Error('Unknown operation');
        }
      } else {
        throw new Error('Must supply a result');
      }
    }

    return Delta;

  })();

}).call(this);
