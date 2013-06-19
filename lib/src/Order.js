(function() {
  var Amount, EventEmitter, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Amount = require('./Amount');

  EventEmitter = require('events').EventEmitter;

  module.exports = Order = (function(_super) {
    var fill, partialBid, partialOffer;

    __extends(Order, _super);

    function Order(params) {
      this.next = __bind(this.next, this);
      this.nextParent = __bind(this.nextParent, this);
      this["export"] = __bind(this["export"], this);
      this.getHighest = __bind(this.getHighest, this);
      this["delete"] = __bind(this["delete"], this);
      this.addLowest = __bind(this.addLowest, this);
      this.add = __bind(this.add, this);
      this.match = __bind(this.match, this);
      this.id = params.id;
      if (!this.id) {
        throw new Error('Order must have an ID');
      }
      this.timestamp = params.timestamp;
      if (!this.timestamp) {
        throw new Error('Order must have a time stamp');
      }
      this.account = params.account;
      if (!this.account) {
        throw new Error('Order must be associated with an account');
      }
      this.bidCurrency = params.bidCurrency;
      if (!this.bidCurrency) {
        throw new Error('Order must be associated with a bid currency');
      }
      this.offerCurrency = params.offerCurrency;
      if (!this.offerCurrency) {
        throw new Error('Order must be associated with an offer currency');
      }
      if (params.offerPrice) {
        this.offerPrice = params.offerPrice;
        if (this.offerPrice.compareTo(Amount.ZERO) < 0) {
          throw new Error('offer price cannot be negative');
        } else {
          if (params.offerAmount) {
            this.offerAmount = params.offerAmount;
            if (this.offerAmount.compareTo(Amount.ZERO) < 0) {
              throw new Error('offer amount cannot be negative');
            } else {
              if (params.bidAmount) {
                throw new Error('Must specify either bid amount and price or offer amount and price');
              } else {
                this.bidAmount = this.offerAmount.multiply(this.offerPrice);
                if (params.bidPrice) {
                  throw new Error('Must specify either bid amount and price or offer amount and price');
                }
              }
            }
          } else {
            throw new Error('Must specify either bid amount and price or offer amount and price');
          }
        }
      } else {
        if (params.bidPrice) {
          this.bidPrice = params.bidPrice;
          if (this.bidPrice.compareTo(Amount.ZERO) < 0) {
            throw new Error('bid price cannot be negative');
          } else {
            if (params.bidAmount) {
              this.bidAmount = params.bidAmount;
              if (this.bidAmount.compareTo(Amount.ZERO) < 0) {
                throw new Error('bid amount cannot be negative');
              } else {
                if (params.offerAmount) {
                  throw new Error('Must specify either bid amount and price or offer amount and price');
                } else {
                  this.offerAmount = this.bidPrice.multiply(this.bidAmount);
                }
              }
            } else {
              throw new Error('Must specify either bid amount and price or offer amount and price');
            }
          }
        } else {
          throw new Error('Must specify either bid amount and price or offer amount and price');
        }
      }
    }

    partialOffer = function(bidAmount, offerAmount, timestamp) {
      this.offerAmount = this.offerAmount.subtract(offerAmount);
      this.bidAmount = this.offerAmount.multiply(this.offerPrice);
      return this.emit('fill', {
        offerAmount: offerAmount,
        bidAmount: bidAmount,
        fundsUnlocked: offerAmount,
        timestamp: timestamp
      });
    };

    partialBid = function(bidAmount, offerAmount, timestamp) {
      var fundsUnlocked, newOfferAmount;
      this.bidAmount = this.bidAmount.subtract(bidAmount);
      newOfferAmount = this.bidAmount.multiply(this.bidPrice);
      fundsUnlocked = this.offerAmount.subtract(newOfferAmount);
      this.offerAmount = newOfferAmount;
      return this.emit('fill', {
        offerAmount: offerAmount,
        bidAmount: bidAmount,
        fundsUnlocked: fundsUnlocked,
        timestamp: timestamp
      });
    };

    fill = function(bidAmount, offerAmount, timestamp) {
      var fundsUnlocked;
      fundsUnlocked = this.offerAmount;
      this.bidAmount = Amount.ZERO;
      this.offerAmount = Amount.ZERO;
      this.emit('fill', {
        offerAmount: offerAmount,
        bidAmount: bidAmount,
        fundsUnlocked: fundsUnlocked,
        timestamp: timestamp
      });
      return this.emit('done');
    };

    Order.prototype.match = function(order) {
      var compareAmounts, leftOfferAmount, price, rightOfferAmount;
      if (this.offerPrice) {
        if (order.bidPrice) {
          if (order.bidPrice.compareTo(this.offerPrice) >= 0) {
            price = order.bidPrice;
            compareAmounts = this.offerAmount.compareTo(order.bidAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
              if (compareAmounts === 0) {
                fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
            compareAmounts = this.offerAmount.compareTo(order.bidAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
              if (compareAmounts === 0) {
                fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
            compareAmounts = this.bidAmount.compareTo(order.offerAmount);
            if (compareAmounts > 0) {
              rightOfferAmount = order.offerAmount;
              leftOfferAmount = rightOfferAmount.multiply(price);
              fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
              if (compareAmounts === 0) {
                fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
            compareAmounts = this.bidAmount.compareTo(order.offerAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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
              if (compareAmounts === 0) {
                fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
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

    Order.prototype.add = function(order) {
      var isHigher;
      if (this.bidPrice) {
        if (order.bidPrice) {
          isHigher = order.bidPrice.compareTo(this.bidPrice) > 0;
        } else {
          isHigher = order.offerPrice.multiply(this.bidPrice).compareTo(Amount.ONE) < 0;
        }
      } else {
        if (order.offerPrice) {
          isHigher = order.offerPrice.compareTo(this.offerPrice) < 0;
        } else {
          isHigher = order.bidPrice.multiply(this.offerPrice).compareTo(Amount.ONE) > 0;
        }
      }
      if (isHigher) {
        if (this.higher) {
          return this.higher.add(order);
        } else {
          this.higher = order;
          return order.parent = this;
        }
      } else {
        if (this.lower) {
          return this.lower.add(order);
        } else {
          this.lower = order;
          return order.parent = this;
        }
      }
    };

    Order.prototype.addLowest = function(order) {
      if (this.lower) {
        return this.lower.addLowest(order);
      } else {
        this.lower = order;
        return order.parent = this;
      }
    };

    Order.prototype["delete"] = function() {
      var newHead;
      if (this.parent) {
        if (this.parent.lower === this) {
          if (this.higher) {
            this.parent.lower = this.higher;
            this.higher.parent = this.parent;
            newHead = this.higher;
            if (this.lower) {
              this.higher.addLowest(this.lower);
            }
          } else if (this.lower) {
            this.parent.lower = this.lower;
            this.lower.parent = this.parent;
            newHead = this.lower;
          } else {
            delete this.parent.lower;
          }
        } else {
          if (this.higher) {
            this.parent.higher = this.higher;
            this.higher.parent = this.parent;
            newHead = this.higher;
            if (this.lower) {
              this.higher.addLowest(this.lower);
            }
          } else if (this.lower) {
            this.parent.higher = this.lower;
            this.lower.parent = this.parent;
            newHead = this.lower;
          } else {
            delete this.parent.higher;
          }
        }
      } else {
        if (this.higher) {
          delete this.higher.parent;
          newHead = this.higher;
          if (this.lower) {
            this.higher.addLowest(this.lower);
          }
        } else if (this.lower) {
          delete this.lower.parent;
          newHead = this.lower;
        } else {

        }
      }
      return newHead;
    };

    Order.prototype.getHighest = function() {
      if (this.higher) {
        return this.higher.getHighest();
      } else {
        return this;
      }
    };

    Order.prototype["export"] = function() {
      var object;
      object = Object.create(null);
      object.id = this.id;
      object.timestamp = this.timestamp;
      object.account = this.account;
      object.bidCurrency = this.bidCurrency;
      object.offerCurrency = this.offerCurrency;
      if (this.bidPrice) {
        object.bidPrice = this.bidPrice.toString();
        object.bidAmount = this.bidAmount.toString();
      } else {
        object.offerPrice = this.offerPrice.toString();
        object.offerAmount = this.offerAmount.toString();
      }
      return object;
    };

    Order.prototype.nextParent = function() {
      if (this.parent) {
        if (this.parent.higher === this) {
          return this.parent;
        } else {
          return this.parent.nextParent();
        }
      }
    };

    Order.prototype.next = function() {
      if (this.lower) {
        return this.lower.getHighest();
      } else {
        return this.nextParent();
      }
    };

    return Order;

  })(EventEmitter);

}).call(this);
