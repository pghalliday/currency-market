(function() {
  var Amount, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('../Amount');

  module.exports = Balance = (function() {
    function Balance(params) {
      this["export"] = __bind(this["export"], this);
      this.withdraw = __bind(this.withdraw, this);
      this.cancel = __bind(this.cancel, this);
      this.submitBid = __bind(this.submitBid, this);
      this.submitOffer = __bind(this.submitOffer, this);
      this.deposit = __bind(this.deposit, this);
      this.funds = Amount.ZERO;
      this.lockedFunds = Amount.ZERO;
      if (params) {
        this.commission = params.commission;
      }
    }

    Balance.prototype.deposit = function(amount) {
      return this.funds = this.funds.add(amount);
    };

    Balance.prototype.submitOffer = function(order) {
      var newLockedFunds,
        _this = this;
      newLockedFunds = this.lockedFunds.add(order.offerAmount);
      if (newLockedFunds.compareTo(this.funds) > 0) {
        throw new Error('Cannot lock funds that are not available');
      } else {
        this.lockedFunds = newLockedFunds;
        return order.on('fill', function(fill) {
          _this.lockedFunds = _this.lockedFunds.subtract(fill.fundsUnlocked);
          return _this.funds = _this.funds.subtract(fill.offerAmount);
        });
      }
    };

    Balance.prototype.submitBid = function(order) {
      var _this = this;
      return order.on('fill', function(fill) {
        var commission;
        if (_this.commission) {
          commission = _this.commission.calculate({
            amount: fill.bidAmount,
            timestamp: fill.timestamp,
            account: order.account,
            currency: order.bidCurrency
          });
          _this.funds = _this.funds.add(fill.bidAmount.subtract(commission));
          return _this.commission.account.deposit({
            currency: order.bidCurrency,
            amount: commission
          });
        } else {
          return _this.funds = _this.funds.add(fill.bidAmount);
        }
      });
    };

    Balance.prototype.cancel = function(order) {
      return this.lockedFunds = this.lockedFunds.subtract(order.offerAmount);
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
