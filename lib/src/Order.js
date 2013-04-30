(function() {
  var Amount, EventEmitter, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Amount = require('./Amount');

  EventEmitter = require('events').EventEmitter;

  module.exports = Order = (function(_super) {
    var fillBid, fillOffer;

    __extends(Order, _super);

    function Order(params) {
      this.match = __bind(this.match, this);
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
                    if (typeof params.offerPrice !== 'undefined') {
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
                  if (typeof params.bidPrice !== 'undefined') {
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
        if (params.state.bidPrice) {
          this.bidPrice = new Amount({
            state: params.state.bidPrice
          });
        }
        this.bidAmount = new Amount({
          state: params.state.bidAmount
        });
        if (params.state.offerPrice) {
          this.offerPrice = new Amount({
            state: params.state.offerPrice
          });
        }
        this.offerAmount = new Amount({
          state: params.state.offerAmount
        });
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
      if (this.bidPrice) {
        state.bidPrice = this.bidPrice["export"]();
      }
      state.bidAmount = this.bidAmount["export"]();
      if (this.offerPrice) {
        state.offerPrice = this.offerPrice["export"]();
      }
      state.offerAmount = this.offerAmount["export"]();
      return state;
    };

    Order.prototype.equals = function(order) {
      if (this.id !== order.id) {
        return false;
      }
      if (this.timestamp !== order.timestamp) {
        return false;
      }
      if (this.account !== order.account) {
        return false;
      }
      if (this.bidCurrency !== order.bidCurrency) {
        return false;
      }
      if (this.offerCurrency !== order.offerCurrency) {
        return false;
      }
      if (this.bidPrice) {
        if (order.bidPrice) {
          if (this.bidPrice.compareTo(order.bidPrice) !== 0) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (order.bidPrice) {
          return false;
        }
      }
      if (this.bidAmount.compareTo(order.bidAmount) !== 0) {
        return false;
      }
      if (this.offerPrice) {
        if (order.offerPrice) {
          if (this.offerPrice.compareTo(order.offerPrice) !== 0) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (order.offerPrice) {
          return false;
        }
      }
      if (this.offerAmount.compareTo(order.offerAmount) !== 0) {
        return false;
      }
      return true;
    };

    fillOffer = function(offerAmount, bidAmount) {
      this.offerAmount = this.offerAmount.subtract(offerAmount);
      this.bidAmount = this.offerAmount.multiply(this.offerPrice);
      return this.emit('fill', {
        order: this,
        offerAmount: offerAmount,
        bidAmount: bidAmount
      });
    };

    fillBid = function(bidAmount, offerAmount) {
      this.bidAmount = this.bidAmount.subtract(bidAmount);
      this.offerAmount = this.bidAmount.multiply(this.bidPrice);
      return this.emit('fill', {
        order: this,
        offerAmount: offerAmount,
        bidAmount: bidAmount
      });
    };

    Order.prototype.match = function(order) {
      var leftOfferAmount, price, rightOfferAmount;

      if (this.offerPrice) {
        if (order.bidPrice) {
          if (order.bidPrice.compareTo(this.offerPrice) >= 0) {
            price = order.bidPrice;
            if (this.offerAmount.compareTo(order.bidAmount) > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fillBid.call(order, leftOfferAmount, rightOfferAmount);
              fillOffer.call(this, leftOfferAmount, rightOfferAmount);
              order.emit('trade', {
                bid: order,
                offer: this,
                price: price,
                amount: leftOfferAmount
              });
              return true;
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.multiply(price);
              fillBid.call(order, leftOfferAmount, rightOfferAmount);
              fillOffer.call(this, leftOfferAmount, rightOfferAmount);
              order.emit('trade', {
                bid: order,
                offer: this,
                price: price,
                amount: leftOfferAmount
              });
              return false;
            }
          }
        } else {
          if (order.offerPrice.multiply(this.offerPrice).compareTo(Amount.ONE) <= 0) {
            price = order.offerPrice;
            if (this.offerAmount.compareTo(order.bidAmount) > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fillOffer.call(order, rightOfferAmount, leftOfferAmount);
              fillOffer.call(this, leftOfferAmount, rightOfferAmount);
              order.emit('trade', {
                bid: this,
                offer: order,
                price: price,
                amount: rightOfferAmount
              });
              return true;
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.divide(price);
              fillOffer.call(order, rightOfferAmount, leftOfferAmount);
              fillOffer.call(this, leftOfferAmount, rightOfferAmount);
              order.emit('trade', {
                bid: this,
                offer: order,
                price: price,
                amount: rightOfferAmount
              });
              return false;
            }
          }
        }
      } else {
        if (order.offerPrice) {
          if (this.bidPrice.compareTo(order.offerPrice) >= 0) {
            price = order.offerPrice;
            if (this.bidAmount.compareTo(order.offerAmount) > 0) {
              rightOfferAmount = order.offerAmount;
              leftOfferAmount = rightOfferAmount.multiply(price);
              fillOffer.call(order, rightOfferAmount, leftOfferAmount);
              fillBid.call(this, rightOfferAmount, leftOfferAmount);
              order.emit('trade', {
                bid: this,
                offer: order,
                price: price,
                amount: rightOfferAmount
              });
              return true;
            } else {
              rightOfferAmount = this.bidAmount;
              leftOfferAmount = rightOfferAmount.multiply(price);
              fillOffer.call(order, rightOfferAmount, leftOfferAmount);
              fillBid.call(this, rightOfferAmount, leftOfferAmount);
              order.emit('trade', {
                bid: this,
                offer: order,
                price: price,
                amount: rightOfferAmount
              });
              return false;
            }
          }
        } else {
          if (order.bidPrice.multiply(this.bidPrice).compareTo(Amount.ONE) >= 0) {
            price = order.bidPrice;
            if (this.bidAmount.compareTo(order.offerAmount) > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fillBid.call(order, leftOfferAmount, rightOfferAmount);
              fillBid.call(this, rightOfferAmount, leftOfferAmount);
              order.emit('trade', {
                bid: order,
                offer: this,
                price: price,
                amount: leftOfferAmount
              });
              return true;
            } else {
              leftOfferAmount = this.bidAmount.divide(price);
              rightOfferAmount = leftOfferAmount.multiply(price);
              fillBid.call(order, leftOfferAmount, rightOfferAmount);
              fillBid.call(this, rightOfferAmount, leftOfferAmount);
              order.emit('trade', {
                bid: order,
                offer: this,
                price: price,
                amount: leftOfferAmount
              });
              return false;
            }
          }
        }
      }
    };

    return Order;

  })(EventEmitter);

}).call(this);
