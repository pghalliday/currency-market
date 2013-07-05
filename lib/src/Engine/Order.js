(function() {
  var Amount, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('../Amount');

  module.exports = Order = (function() {
    var fill, partialBid, partialOffer;

    function Order(params) {
      this.toJSON = __bind(this.toJSON, this);
      this.next = __bind(this.next, this);
      this.nextParent = __bind(this.nextParent, this);
      this.getHighest = __bind(this.getHighest, this);
      this["delete"] = __bind(this["delete"], this);
      this.addLowest = __bind(this.addLowest, this);
      this.add = __bind(this.add, this);
      this.match = __bind(this.match, this);
      this.sequence = params.sequence;
      if (typeof this.sequence === 'undefined') {
        throw new Error('Order must have a sequence');
      }
      this.timestamp = params.timestamp;
      if (typeof this.timestamp === 'undefined') {
        throw new Error('Order must have a timestamp');
      }
      this.account = params.account;
      if (!this.account) {
        throw new Error('Order must be associated with an account');
      }
      this.book = params.book;
      if (this.book) {
        this.bidBalance = this.account.getBalance(this.book.bidCurrency);
        this.offerBalance = this.account.getBalance(this.book.offerCurrency);
      } else {
        throw new Error('Order must be associated with a book');
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
      var delta;
      this.offerAmount = this.offerAmount.subtract(offerAmount);
      this.bidAmount = this.offerAmount.multiply(this.offerPrice);
      return delta = {
        remainder: {
          bidAmount: this.bidAmount.toString(),
          offerAmount: this.offerAmount.toString()
        },
        transaction: {
          credit: this.bidBalance.applyBid({
            amount: bidAmount,
            timestamp: timestamp
          }),
          debit: this.offerBalance.applyOffer({
            amount: offerAmount,
            fundsUnlocked: offerAmount
          })
        }
      };
    };

    partialBid = function(bidAmount, offerAmount, timestamp) {
      var delta, fundsUnlocked, newOfferAmount;
      this.bidAmount = this.bidAmount.subtract(bidAmount);
      newOfferAmount = this.bidAmount.multiply(this.bidPrice);
      fundsUnlocked = this.offerAmount.subtract(newOfferAmount);
      this.offerAmount = newOfferAmount;
      return delta = {
        remainder: {
          bidAmount: this.bidAmount.toString(),
          offerAmount: this.offerAmount.toString()
        },
        transaction: {
          credit: this.bidBalance.applyBid({
            amount: bidAmount,
            timestamp: timestamp
          }),
          debit: this.offerBalance.applyOffer({
            amount: offerAmount,
            fundsUnlocked: fundsUnlocked
          })
        }
      };
    };

    fill = function(bidAmount, offerAmount, timestamp) {
      var delta, fundsUnlocked;
      fundsUnlocked = this.offerAmount;
      this.bidAmount = Amount.ZERO;
      this.offerAmount = Amount.ZERO;
      delta = {
        transaction: {
          credit: this.bidBalance.applyBid({
            amount: bidAmount,
            timestamp: timestamp
          }),
          debit: this.offerBalance.applyOffer({
            amount: offerAmount,
            fundsUnlocked: fundsUnlocked
          })
        }
      };
      this.account.complete(this);
      this.book.cancel(this);
      return delta;
    };

    Order.prototype.match = function(order) {
      var compareAmounts, leftDelta, leftOfferAmount, price, rightDelta, rightOfferAmount, trade;
      trade = void 0;
      if (this.offerPrice) {
        if (order.bidPrice) {
          if (order.bidPrice.compareTo(this.offerPrice) >= 0) {
            price = order.bidPrice;
            compareAmounts = this.offerAmount.compareTo(order.bidAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftDelta = partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightDelta = partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftDelta = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            }
          }
        } else {
          if (order.offerPrice.multiply(this.offerPrice).compareTo(Amount.ONE) <= 0) {
            price = order.offerPrice;
            compareAmounts = this.offerAmount.compareTo(order.bidAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftDelta = partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.divide(price);
              if (compareAmounts === 0) {
                rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightDelta = partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftDelta = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
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
              rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftDelta = partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            } else {
              rightOfferAmount = this.bidAmount;
              leftOfferAmount = rightOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightDelta = partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftDelta = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            }
          }
        } else {
          if (order.bidPrice.multiply(this.bidPrice).compareTo(Amount.ONE) >= 0) {
            price = order.bidPrice;
            compareAmounts = this.bidAmount.compareTo(order.offerAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftDelta = partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            } else {
              leftOfferAmount = this.bidAmount.divide(price);
              rightOfferAmount = leftOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightDelta = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightDelta = partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftDelta = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              trade = {
                left: leftDelta,
                right: rightDelta
              };
            }
          }
        }
      }
      return trade;
    };

    Order.prototype.add = function(order, nextHigher) {
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
          nextHigher = this.higher.add(order, nextHigher);
        } else {
          this.higher = order;
          order.lowerParent = this;
        }
      } else {
        if (this.lower) {
          nextHigher = this.lower.add(order, this);
        } else {
          nextHigher = this;
          this.lower = order;
          order.higherParent = this;
        }
      }
      return nextHigher;
    };

    Order.prototype.addLowest = function(order) {
      if (this.lower) {
        return this.lower.addLowest(order);
      } else {
        this.lower = order;
        return order.higherParent = this;
      }
    };

    Order.prototype["delete"] = function() {
      var newHead;
      if (this.higherParent) {
        if (this.higher) {
          this.higherParent.lower = this.higher;
          delete this.higher.lowerParent;
          this.higher.higherParent = this.higherParent;
          newHead = this.higher;
          if (this.lower) {
            this.higher.addLowest(this.lower);
          }
        } else if (this.lower) {
          this.higherParent.lower = this.lower;
          this.lower.higherParent = this.higherParent;
          newHead = this.lower;
        } else {
          delete this.higherParent.lower;
        }
      } else if (this.lowerParent) {
        if (this.higher) {
          this.lowerParent.higher = this.higher;
          this.higher.lowerParent = this.lowerParent;
          newHead = this.higher;
          if (this.lower) {
            this.higher.addLowest(this.lower);
          }
        } else if (this.lower) {
          this.lowerParent.higher = this.lower;
          delete this.lower.higherParent;
          this.lower.lowerParent = this.lowerParent;
          newHead = this.lower;
        } else {
          delete this.lowerParent.higher;
        }
      } else {
        if (this.higher) {
          delete this.higher.lowerParent;
          newHead = this.higher;
          if (this.lower) {
            this.higher.addLowest(this.lower);
          }
        } else if (this.lower) {
          delete this.lower.higherParent;
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

    Order.prototype.nextParent = function() {
      if (this.lowerParent) {
        return this.lowerParent;
      } else if (this.higherParent) {
        return this.higherParent.nextParent();
      }
    };

    Order.prototype.next = function() {
      if (this.lower) {
        return this.lower.getHighest();
      } else {
        return this.nextParent();
      }
    };

    Order.prototype.toJSON = function() {
      var object;
      return object = {
        sequence: this.sequence,
        timestamp: this.timestamp,
        account: this.account.id,
        bidCurrency: this.book.bidCurrency,
        offerCurrency: this.book.offerCurrency,
        bidPrice: this.bidPrice,
        bidAmount: this.bidPrice ? this.bidAmount : void 0,
        offerPrice: this.offerPrice,
        offerAmount: this.offerPrice ? this.offerAmount : void 0
      };
    };

    return Order;

  })();

}).call(this);
