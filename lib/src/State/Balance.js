(function() {
  var Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = Balance = (function() {
    function Balance(params) {
      this.getLockedFunds = __bind(this.getLockedFunds, this);
      this.getFunds = __bind(this.getFunds, this);
      this.setLockedFunds = __bind(this.setLockedFunds, this);
      this.setFunds = __bind(this.setFunds, this);
      if (params) {
        this.funds = params.funds;
        this.lockedFunds = params.lockedFunds;
      } else {
        this.funds = '0';
        this.lockedFunds = '0';
      }
    }

    Balance.prototype.setFunds = function(amount) {
      return this.funds = amount;
    };

    Balance.prototype.setLockedFunds = function(amount) {
      return this.lockedFunds = amount;
    };

    Balance.prototype.getFunds = function() {
      return this.funds;
    };

    Balance.prototype.getLockedFunds = function() {
      return this.lockedFunds;
    };

    return Balance;

  })();

}).call(this);
