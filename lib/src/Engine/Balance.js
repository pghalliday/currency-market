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
      return this.funds = this.funds.add(amount);
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
      return this.lockedFunds = this.lockedFunds.subtract(amount);
    };

    Balance.prototype.applyOffer = function(params) {
      var debit;
      debit = {
        amount: params.amount
      };
      this.lockedFunds = this.lockedFunds.subtract(params.fundsUnlocked);
      this.funds = this.funds.subtract(debit.amount);
      return debit;
    };

    Balance.prototype.applyBid = function(params) {
      var credit;
      if (this.commissionBalance) {
        credit = {
          commission: this.commissionCalculate({
            amount: params.amount,
            timestamp: params.timestamp,
            account: this.account,
            currency: this.currency
          })
        };
        credit.amount = params.amount.subtract(credit.commission.amount);
        this.funds = this.funds.add(credit.amount);
        this.commissionBalance.deposit(credit.commission.amount);
        return credit;
      } else {
        credit = {
          amount: params.amount
        };
        this.funds = this.funds.add(credit.amount);
        return credit;
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
