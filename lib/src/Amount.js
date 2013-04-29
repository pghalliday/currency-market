(function() {
  var Amount, BigDecimal, ROUND_DOWN, SCALE,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BigDecimal = require('bigdecimal').BigDecimal;

  ROUND_DOWN = require('bigdecimal').RoundingMode.DOWN();

  SCALE = 25;

  module.exports = Amount = (function() {
    function Amount(value) {
      this.toString = __bind(this.toString, this);
      this.divide = __bind(this.divide, this);
      this.multiply = __bind(this.multiply, this);
      this.subtract = __bind(this.subtract, this);
      this.add = __bind(this.add, this);
      this.compareTo = __bind(this.compareTo, this);
      this["export"] = __bind(this["export"], this);
      var e;

      if (value instanceof BigDecimal) {
        this.value = value;
      } else if (typeof value === 'string') {
        try {
          this.value = new BigDecimal(value);
        } catch (_error) {
          e = _error;
          throw new Error('String initializer cannot be parsed to a number');
        }
      } else if (value.state) {
        this.value = new BigDecimal(value.state.value);
      } else {
        throw new Error('Must intialize from string');
      }
    }

    Amount.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      state.value = this.value.toPlainString();
      return state;
    };

    Amount.prototype.compareTo = function(amount) {
      if (amount instanceof Amount) {
        return this.value.compareTo(amount.value);
      } else {
        throw new Error('Can only compare to Amount objects');
      }
    };

    Amount.prototype.add = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.add(amount.value));
      } else {
        throw new Error('Can only add Amount objects');
      }
    };

    Amount.prototype.subtract = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.subtract(amount.value));
      } else {
        throw new Error('Can only subtract Amount objects');
      }
    };

    Amount.prototype.multiply = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.multiply(amount.value));
      } else {
        throw new Error('Can only multiply Amount objects');
      }
    };

    Amount.prototype.divide = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.divide(amount.value, SCALE, ROUND_DOWN).stripTrailingZeros());
      } else {
        throw new Error('Can only divide Amount objects');
      }
    };

    Amount.prototype.toString = function() {
      return this.value.stripTrailingZeros().toPlainString();
    };

    return Amount;

  })();

  Amount.ZERO = new Amount('0');

  Amount.ONE = new Amount('1');

}).call(this);
