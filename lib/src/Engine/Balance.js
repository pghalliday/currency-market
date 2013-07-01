(function() {
  var Amount, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('../Amount');

  module.exports = Balance = (function() {
    function Balance(params) {
      this["export"] = __bind(this["export"], this);
      this.applyBid = __bind(this.applyBid, this);
      this.applyOffer = __bind(this.applyOffer, this);
      this.unlock = __bind(this.unlock, this);
      this.lock = __bind(this.lock, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      if (params.account) {
        if (params.currency) {
          this.funds = Amount.ZERO;
          this.lockedFunds = Amount.ZERO;
          this.account = params.account;
          this.currency = params.currency;
          if (params.commission) {
            this.commissionBalance = params.commission.account.getBalance(this.currency);
            this.commissionCalculate = params.commission.calculate;
          }
        } else {
          throw new Error('Must supply a currency');
        }
      } else {
        throw new Error('Must supply an account');
      }
    }

    Balance.prototype.deposit = function(amount) {
      this.funds = this.funds.add(amount);
      return this.funds.toString();
    };

    Balance.prototype.withdraw = function(amount) {
      var newFunds;
      newFunds = this.funds.subtract(amount);
      if (newFunds.compareTo(this.lockedFunds) < 0) {
        throw new Error('Cannot withdraw funds that are not available');
      } else {
        this.funds = newFunds;
        return this.funds.toString();
      }
    };

    Balance.prototype.lock = function(amount) {
      var newLockedFunds;
      newLockedFunds = this.lockedFunds.add(amount);
      if (newLockedFunds.compareTo(this.funds) > 0) {
        throw new Error('Cannot lock funds that are not available');
      } else {
        this.lockedFunds = newLockedFunds;
        return this.lockedFunds.toString();
      }
    };

    Balance.prototype.unlock = function(amount) {
      this.lockedFunds = this.lockedFunds.subtract(amount);
      return this.lockedFunds.toString();
    };

    Balance.prototype.applyOffer = function(params) {
      var debit;
      this.lockedFunds = this.lockedFunds.subtract(params.fundsUnlocked);
      this.funds = this.funds.subtract(params.amount);
      return debit = {
        amount: params.amount.toString(),
        funds: this.funds.toString(),
        lockedFunds: this.lockedFunds.toString()
      };
    };

    Balance.prototype.applyBid = function(params) {
      var amount, commission, credit;
      if (this.commissionBalance) {
        commission = this.commissionCalculate({
          amount: params.amount,
          timestamp: params.timestamp,
          account: this.account,
          currency: this.currency
        });
        amount = params.amount.subtract(commission.amount);
        this.funds = this.funds.add(amount);
        return credit = {
          amount: amount.toString(),
          funds: this.funds.toString(),
          commission: {
            amount: commission.amount.toString(),
            funds: this.commissionBalance.deposit(commission.amount),
            reference: commission.reference
          }
        };
      } else {
        this.funds = this.funds.add(params.amount);
        return credit = {
          amount: params.amount.toString(),
          funds: this.funds.toString()
        };
      }
    };

    Balance.prototype["export"] = function() {
      var object;
      object = Object.create(null);
      object.funds = this.funds.toString();
      object.lockedFunds = this.lockedFunds.toString();
      return object;
    };

    return Balance;

  })();

}).call(this);
