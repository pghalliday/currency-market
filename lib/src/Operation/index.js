(function() {
  var Cancel, Deposit, Operation, Submit, Withdraw;

  Deposit = require('./Deposit');

  Withdraw = require('./Withdraw');

  Submit = require('./Submit');

  Cancel = require('./Cancel');

  module.exports = Operation = (function() {
    function Operation(params) {
      var cancel, deposit, exported, submit, withdraw;

      exported = params.exported;
      if (params.json) {
        exported = JSON.parse(params.json);
      }
      if (exported) {
        params = exported;
        if (params.deposit) {
          params.deposit = {
            exported: params.deposit
          };
        }
        if (params.withdraw) {
          params.withdraw = {
            exported: params.withdraw
          };
        }
        if (params.submit) {
          params.submit = {
            exported: params.submit
          };
        }
        if (params.cancel) {
          params.cancel = {
            exported: params.cancel
          };
        }
      }
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
      deposit = params.deposit;
      withdraw = params.withdraw;
      submit = params.submit;
      cancel = params.cancel;
      if (deposit) {
        this.deposit = new Deposit(deposit);
      } else if (withdraw) {
        this.withdraw = new Withdraw(withdraw);
      } else if (submit) {
        this.submit = new Submit(submit);
      } else if (cancel) {
        this.cancel = new Cancel(cancel);
      } else {
        throw new Error('Unknown operation');
      }
    }

    return Operation;

  })();

}).call(this);
