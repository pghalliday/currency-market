(function() {
  var Amount, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('../Amount');

  module.exports = Order = (function() {
    var fill, partialBid, partialOffer;

    function Order(params) {
      this.next = __bind(this.next, this);
      this.nextParent = __bind(this.nextParent, this);
      this["export"] = __bind(this["export"], this);
      this.getHighest = __bind(this.getHighest, this);
      this["delete"] = __bind(this["delete"], this);
      this.addLowest = __bind(this.addLowest, this);
      this.add = __bind(this.add, this);
      this.match = __bind(this.match, this);      this.sequence = params.sequence;
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
      var balanceDeltas;

      this.offerAmount = this.offerAmount.subtract(offerAmount);
      this.bidAmount = this.offerAmount.multiply(this.offerPrice);
      return balanceDeltas = {
        credit: this.bidBalance.applyBid({
          amount: bidAmount,
          timestamp: timestamp
        }),
        debit: this.offerBalance.applyOffer({
          amount: offerAmount,
          fundsUnlocked: offerAmount
        })
      };
    };

    partialBid = function(bidAmount, offerAmount, timestamp) {
      var balanceDeltas, fundsUnlocked, newOfferAmount;

      this.bidAmount = this.bidAmount.subtract(bidAmount);
      newOfferAmount = this.bidAmount.multiply(this.bidPrice);
      fundsUnlocked = this.offerAmount.subtract(newOfferAmount);
      this.offerAmount = newOfferAmount;
      return balanceDeltas = {
        credit: this.bidBalance.applyBid({
          amount: bidAmount,
          timestamp: timestamp
        }),
        debit: this.offerBalance.applyOffer({
          amount: offerAmount,
          fundsUnlocked: fundsUnlocked
        })
      };
    };

    fill = function(bidAmount, offerAmount, timestamp) {
      var balanceDeltas, fundsUnlocked;

      fundsUnlocked = this.offerAmount;
      this.bidAmount = Amount.ZERO;
      this.offerAmount = Amount.ZERO;
      balanceDeltas = {
        credit: this.bidBalance.applyBid({
          amount: bidAmount,
          timestamp: timestamp
        }),
        debit: this.offerBalance.applyOffer({
          amount: offerAmount,
          fundsUnlocked: fundsUnlocked
        })
      };
      this.account.complete(this);
      this.book.cancel(this);
      return balanceDeltas;
    };

    Order.prototype.match = function(order) {
      var compareAmounts, leftBalanceDeltas, leftOfferAmount, price, result, rightBalanceDeltas, rightOfferAmount;

      result = {
        complete: false
      };
      if (this.offerPrice) {
        if (order.bidPrice) {
          if (order.bidPrice.compareTo(this.offerPrice) >= 0) {
            price = order.bidPrice;
            compareAmounts = this.offerAmount.compareTo(order.bidAmount);
            if (compareAmounts > 0) {
              leftOfferAmount = order.bidAmount;
              rightOfferAmount = order.offerAmount;
              rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftBalanceDeltas = partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
              };
              return result;
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightBalanceDeltas = partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftBalanceDeltas = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.complete = true;
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
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
              rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftBalanceDeltas = partialOffer.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
              };
            } else {
              leftOfferAmount = this.offerAmount;
              rightOfferAmount = leftOfferAmount.divide(price);
              if (compareAmounts === 0) {
                rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightBalanceDeltas = partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftBalanceDeltas = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.complete = true;
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
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
              rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftBalanceDeltas = partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
              };
            } else {
              rightOfferAmount = this.bidAmount;
              leftOfferAmount = rightOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightBalanceDeltas = partialOffer.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftBalanceDeltas = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.complete = true;
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
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
              rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              leftBalanceDeltas = partialBid.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
              };
            } else {
              leftOfferAmount = this.bidAmount.divide(price);
              rightOfferAmount = leftOfferAmount.multiply(price);
              if (compareAmounts === 0) {
                rightBalanceDeltas = fill.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              } else {
                rightBalanceDeltas = partialBid.call(order, leftOfferAmount, rightOfferAmount, this.timestamp);
              }
              leftBalanceDeltas = fill.call(this, rightOfferAmount, leftOfferAmount, this.timestamp);
              result.complete = true;
              result.trade = {
                left: leftBalanceDeltas,
                right: rightBalanceDeltas
              };
            }
          }
        }
      }
      return result;
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
          order.parent = this;
        }
      } else {
        if (this.lower) {
          nextHigher = this.lower.add(order, this);
        } else {
          nextHigher = this;
          this.lower = order;
          order.parent = this;
        }
      }
      return nextHigher;
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
      object.sequence = this.sequence;
      object.timestamp = this.timestamp;
      object.account = this.account.id;
      object.bidCurrency = this.book.bidCurrency;
      object.offerCurrency = this.book.offerCurrency;
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

  })();

}).call(this);
