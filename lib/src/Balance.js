(function() {
  var Amount, Balance,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('./Amount');

  module.exports = Balance = (function() {
    function Balance(params) {
      this.withdraw = __bind(this.withdraw, this);
      this.cancel = __bind(this.cancel, this);
      this.submitBid = __bind(this.submitBid, this);
      this.submitOffer = __bind(this.submitOffer, this);
      this.deposit = __bind(this.deposit, this);      this.offers = Object.create(null);
      this.funds = Amount.ZERO;
      this.lockedFunds = Amount.ZERO;
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
        this.offers[order.id] = order;
        this.lockedFunds = newLockedFunds;
        order.on('fill', function(fill) {
          _this.lockedFunds = _this.lockedFunds.subtract(fill.fundsUnlocked);
          return _this.funds = _this.funds.subtract(fill.offerAmount);
        });
        return order.on('done', function() {
          return delete _this.offers[order.id];
        });
      }
    };

    Balance.prototype.submitBid = function(order) {
      var _this = this;

      return order.on('fill', function(fill) {
        return _this.funds = _this.funds.add(fill.bidAmount);
      });
    };

    Balance.prototype.cancel = function(order) {
      this.lockedFunds = this.lockedFunds.subtract(order.offerAmount);
      return delete this.offers[order.id];
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

    return Balance;

  })();

}).call(this);
