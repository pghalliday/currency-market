(function() {
  var Amount, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('./Amount');

  module.exports = Balance = (function() {
    function Balance(params) {
      this.equals = __bind(this.equals, this);
      this.withdraw = __bind(this.withdraw, this);
      this.unlock = __bind(this.unlock, this);
      this.lock = __bind(this.lock, this);
      this.deposit = __bind(this.deposit, this);
      this["export"] = __bind(this["export"], this);      if (typeof params === 'undefined') {
        this.funds = Amount.ZERO;
        this.lockedFunds = Amount.ZERO;
      } else {
        this.funds = new Amount({
          state: params.state.funds
        });
        this.lockedFunds = new Amount({
          state: params.state.lockedFunds
        });
      }
    }

    Balance.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      state.funds = this.funds["export"]();
      state.lockedFunds = this.lockedFunds["export"]();
      return state;
    };

    Balance.prototype.deposit = function(amount) {
      return this.funds = this.funds.add(amount);
    };

    Balance.prototype.lock = function(amount) {
      var newLockedFunds;

      newLockedFunds = this.lockedFunds.add(amount);
      if (newLockedFunds.compareTo(this.funds) > 0) {
        throw new Error('Cannot lock funds that are not available');
      } else {
        return this.lockedFunds = newLockedFunds;
      }
    };

    Balance.prototype.unlock = function(amount) {
      var newLockedFunds;

      newLockedFunds = this.lockedFunds.subtract(amount);
      if (newLockedFunds.compareTo(Amount.ZERO) < 0) {
        throw new Error('Cannot unlock funds that are not locked');
      } else {
        return this.lockedFunds = newLockedFunds;
      }
    };

    Balance.prototype.withdraw = function(amount) {
      var newFunds;

      newFunds = this.funds.subtract(amount);
      if (newFunds.compareTo(this.lockedFunds) < 0) {
        throw new Error('Cannot withdraw funds that are not available');
      } else {
        return this.funds = newFunds;
      }
    };

    Balance.prototype.equals = function(balance) {
      return this.funds.compareTo(balance.funds) === 0 && this.lockedFunds.compareTo(balance.lockedFunds) === 0;
    };

    return Balance;

  })();

}).call(this);
