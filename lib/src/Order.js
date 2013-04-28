(function() {
  var Amount, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('./Amount');

  module.exports = Order = (function() {
    function Order(params) {
      this.reduceBid = __bind(this.reduceBid, this);
      this.reduceOffer = __bind(this.reduceOffer, this);
      this.equals = __bind(this.equals, this);
      this["export"] = __bind(this["export"], this);      if (typeof params.state === 'undefined') {
        this.id = params.id;
        if (typeof this.id === 'undefined') {
          throw new Error('Order must have an ID');
        }
        this.timestamp = params.timestamp;
        if (typeof this.timestamp === 'undefined') {
          throw new Error('Order must have a time stamp');
        }
        this.account = params.account;
        if (typeof this.account === 'undefined') {
          throw new Error('Order must be associated with an account');
        }
        this.bidCurrency = params.bidCurrency;
        if (typeof this.bidCurrency === 'undefined') {
          throw new Error('Order must be associated with a bid currency');
        }
        this.offerCurrency = params.offerCurrency;
        if (typeof this.offerCurrency === 'undefined') {
          throw new Error('Order must be associated with an offer currency');
        }
        if (typeof params.offerPrice === 'undefined') {
          if (typeof params.bidPrice === 'undefined') {
            throw new Error('Must specify either bid amount and price or offer amount and price');
          } else {
            this.type = Order.BID;
            this.bidPrice = params.bidPrice;
            if (this.bidPrice.compareTo(Amount.ZERO) < 0) {
              throw new Error('bid price cannot be negative');
            } else {
              if (typeof params.bidAmount === 'undefined') {
                throw new Error('Must specify either bid amount and price or offer amount and price');
              } else {
                this.bidAmount = params.bidAmount;
                if (this.bidAmount.compareTo(Amount.ZERO) < 0) {
                  throw new Error('bid amount cannot be negative');
                } else {
                  if (typeof params.offerAmount === 'undefined') {
                    this.offerAmount = this.bidPrice.multiply(this.bidAmount);
                    if (typeof params.offerPrice === 'undefined') {
                      this.offerPrice = this.bidAmount.divide(this.offerAmount);
                    } else {
                      throw new Error('Must specify either bid amount and price or offer amount and price');
                    }
                  } else {
                    throw new Error('Must specify either bid amount and price or offer amount and price');
                  }
                }
              }
            }
          }
        } else {
          this.type = Order.OFFER;
          this.offerPrice = params.offerPrice;
          if (this.offerPrice.compareTo(Amount.ZERO) < 0) {
            throw new Error('offer price cannot be negative');
          } else {
            if (typeof params.offerAmount === 'undefined') {
              throw new Error('Must specify either bid amount and price or offer amount and price');
            } else {
              this.offerAmount = params.offerAmount;
              if (this.offerAmount.compareTo(Amount.ZERO) < 0) {
                throw new Error('offer amount cannot be negative');
              } else {
                if (typeof params.bidAmount === 'undefined') {
                  this.bidAmount = this.offerAmount.multiply(this.offerPrice);
                  if (typeof params.bidPrice === 'undefined') {
                    this.bidPrice = this.offerAmount.divide(this.bidAmount);
                  } else {
                    throw new Error('Must specify either bid amount and price or offer amount and price');
                  }
                } else {
                  throw new Error('Must specify either bid amount and price or offer amount and price');
                }
              }
            }
          }
        }
      } else {
        this.id = params.state.id;
        this.timestamp = params.state.timestamp;
        this.account = params.state.account;
        this.bidCurrency = params.state.bidCurrency;
        this.offerCurrency = params.state.offerCurrency;
        this.bidPrice = new Amount({
          state: params.state.bidPrice
        });
        this.bidAmount = new Amount({
          state: params.state.bidAmount
        });
        this.offerPrice = new Amount({
          state: params.state.offerPrice
        });
        this.offerAmount = new Amount({
          state: params.state.offerAmount
        });
        this.type = params.state.type;
      }
    }

    Order.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      state.id = this.id;
      state.timestamp = this.timestamp;
      state.account = this.account;
      state.bidCurrency = this.bidCurrency;
      state.offerCurrency = this.offerCurrency;
      state.bidPrice = this.bidPrice["export"]();
      state.bidAmount = this.bidAmount["export"]();
      state.offerPrice = this.offerPrice["export"]();
      state.offerAmount = this.offerAmount["export"]();
      state.type = this.type;
      return state;
    };

    Order.prototype.equals = function(order) {
      return this.id === order.id && this.timestamp === order.timestamp && this.account === order.account && this.bidCurrency === order.bidCurrency && this.offerCurrency === order.offerCurrency && this.bidPrice.compareTo(order.bidPrice) === 0 && this.bidAmount.compareTo(order.bidAmount) === 0 && this.offerPrice.compareTo(order.offerPrice) === 0 && this.offerAmount.compareTo(order.offerAmount) === 0 && this.type === order.type;
    };

    Order.prototype.reduceOffer = function(amount) {
      if (amount.compareTo(this.offerAmount) > 0) {
        throw new Error('offer amount cannot be negative');
      } else {
        this.offerAmount = this.offerAmount.subtract(amount);
        return this.bidAmount = this.offerAmount.multiply(this.offerPrice);
      }
    };

    Order.prototype.reduceBid = function(amount) {
      if (amount.compareTo(this.bidAmount) > 0) {
        throw new Error('bid amount cannot be negative');
      } else {
        this.bidAmount = this.bidAmount.subtract(amount);
        return this.offerAmount = this.bidAmount.multiply(this.bidPrice);
      }
    };

    return Order;

  })();

  Order.BID = 1;

  Order.OFFER = 2;

}).call(this);
