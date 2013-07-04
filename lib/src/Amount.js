(function() {
  var Amount, Big,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Big = require('../thirdparty/big');

  Big.DP = 25;

  Big.RM = 0;

  module.exports = Amount = (function() {
    function Amount(value) {
      this.toJSON = __bind(this.toJSON, this);
      this.toString = __bind(this.toString, this);
      this.divide = __bind(this.divide, this);
      this.multiply = __bind(this.multiply, this);
      this.subtract = __bind(this.subtract, this);
      this.add = __bind(this.add, this);
      this.compareTo = __bind(this.compareTo, this);
      var e;

      if (value instanceof Big) {
        this.value = value;
      } else if (typeof value === 'string') {
        try {
          this.value = new Big(value);
        } catch (_error) {
          e = _error;
          throw new Error('String initializer cannot be parsed to a number');
        }
      } else {
        throw new Error('Must intialize from string');
      }
    }

    Amount.prototype.compareTo = function(amount) {
      if (amount instanceof Amount) {
        return this.value.cmp(amount.value);
      } else {
        throw new Error('Can only compare to Amount objects');
      }
    };

    Amount.prototype.add = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.plus(amount.value));
      } else {
        throw new Error('Can only add Amount objects');
      }
    };

    Amount.prototype.subtract = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.minus(amount.value));
      } else {
        throw new Error('Can only subtract Amount objects');
      }
    };

    Amount.prototype.multiply = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.times(amount.value));
      } else {
        throw new Error('Can only multiply Amount objects');
      }
    };

    Amount.prototype.divide = function(amount) {
      if (amount instanceof Amount) {
        return new Amount(this.value.div(amount.value));
      } else {
        throw new Error('Can only divide Amount objects');
      }
    };

    Amount.prototype.toString = function() {
      return this.value.toString();
    };

    Amount.prototype.toJSON = function() {
      return this.value.toString();
    };

    return Amount;

  })();

  Amount.ZERO = new Amount('0');

  Amount.ONE = new Amount('1');

}).call(this);
