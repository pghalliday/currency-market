(function() {
  var Amount, BigDecimal, ROUND_HALF_UP, SCALE,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BigDecimal = require('bigdecimal').BigDecimal;

  ROUND_HALF_UP = require('bigdecimal').RoundingMode.HALF_UP();

  SCALE = 25;

  module.exports = Amount = (function() {
    function Amount(value, divisor) {
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
        if (divisor) {
          this.divisor = divisor;
        }
      } else if (typeof value === 'string') {
        try {
          this.value = new BigDecimal(value);
        } catch (_error) {
          e = _error;
          throw new Error('String initializer cannot be parsed to a number');
        }
      } else if (value.state) {
        this.value = new BigDecimal(value.state.value);
        if (value.state.divisor) {
          this.divisor = new BigDecimal(value.state.divisor);
        }
      } else {
        throw new Error('Must intialize from string');
      }
    }

    Amount.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      state.value = this.value.toPlainString();
      if (this.divisor) {
        state.divisor = this.divisor.toPlainString();
      }
      return state;
    };

    Amount.prototype.compareTo = function(amount) {
      if (amount instanceof Amount) {
        if (this.divisor) {
          if (amount.divisor) {
            return (this.value.multiply(amount.divisor)).compareTo(amount.value.multiply(this.divisor));
          } else {
            return this.value.compareTo(amount.value.multiply(this.divisor));
          }
        } else {
          if (amount.divisor) {
            return (this.value.multiply(amount.divisor)).compareTo(amount.value);
          } else {
            return this.value.compareTo(amount.value);
          }
        }
      } else {
        throw new Error('Can only compare to Amount objects');
      }
    };

    Amount.prototype.add = function(amount) {
      if (amount instanceof Amount) {
        if (this.divisor) {
          if (amount.divisor) {
            return new Amount((this.value.multiply(amount.divisor)).add(amount.value.multiply(this.divisor)), this.divisor.multiply(amount.divisor));
          } else {
            return new Amount(this.value.add(amount.value.multiply(this.divisor)), this.divisor);
          }
        } else {
          if (amount.divisor) {
            return new Amount((this.value.multiply(amount.divisor)).add(amount.value), amount.divisor);
          } else {
            return new Amount(this.value.add(amount.value));
          }
        }
      } else {
        throw new Error('Can only add Amount objects');
      }
    };

    Amount.prototype.subtract = function(amount) {
      if (amount instanceof Amount) {
        if (this.divisor) {
          if (amount.divisor) {
            return new Amount((this.value.multiply(amount.divisor)).subtract(amount.value.multiply(this.divisor)), this.divisor.multiply(amount.divisor));
          } else {
            return new Amount(this.value.subtract(amount.value.multiply(this.divisor)), this.divisor);
          }
        } else {
          if (amount.divisor) {
            return new Amount((this.value.multiply(amount.divisor)).subtract(amount.value), amount.divisor);
          } else {
            return new Amount(this.value.subtract(amount.value));
          }
        }
        if (this.value.compareTo(BigDecimal.ZERO) === 0) {
          return delete this.divisor;
        }
      } else {
        throw new Error('Can only subtract Amount objects');
      }
    };

    Amount.prototype.multiply = function(amount) {
      if (amount instanceof Amount) {
        if (this.divisor) {
          if (amount.divisor) {
            return new Amount(this.value.multiply(amount.value), this.divisor.multiply(amount.divisor));
          } else {
            return new Amount(this.value.multiply(amount.value), this.divisor);
          }
        } else {
          if (amount.divisor) {
            return new Amount(this.value.multiply(amount.value), amount.divisor);
          } else {
            return new Amount(this.value.multiply(amount.value));
          }
        }
      } else {
        throw new Error('Can only multiply Amount objects');
      }
    };

    Amount.prototype.divide = function(amount) {
      if (amount instanceof Amount) {
        if (this.divisor) {
          if (amount.divisor) {
            return new Amount(this.value.multiply(amount.divisor), amount.value.multiply(this.divisor));
          } else {
            return new Amount(this.value, amount.value.multiply(this.divisor));
          }
        } else {
          if (amount.divisor) {
            return new Amount(this.value.multiply(amount.divisor), amount.value);
          } else {
            return new Amount(this.value, amount.value);
          }
        }
      } else {
        throw new Error('Can only divide Amount objects');
      }
    };

    Amount.prototype.toString = function() {
      if (this.divisor) {
        return this.value.divide(this.divisor, SCALE, ROUND_HALF_UP).stripTrailingZeros().toPlainString();
      } else {
        return this.value.stripTrailingZeros().toPlainString();
      }
    };

    return Amount;

  })();

  Amount.ZERO = new Amount('0');

}).call(this);
