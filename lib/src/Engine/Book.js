(function() {
  var Amount, Book,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('../Amount');

  module.exports = Book = (function() {
    function Book(params) {
      this.toJSON = __bind(this.toJSON, this);
      this.next = __bind(this.next, this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.bidCurrency = params.bidCurrency;
      if (this.bidCurrency) {
        this.offerCurrency = params.offerCurrency;
        if (!this.offerCurrency) {
          throw new Error('Must supply an offer currency');
        }
      } else {
        throw new Error('Must supply a bid currency');
      }
    }

    Book.prototype.submit = function(order) {
      var isHighest, nextHigher;
      nextHigher = void 0;
      if (this.head) {
        if (this.highest.bidPrice) {
          if (order.bidPrice) {
            isHighest = order.bidPrice.compareTo(this.highest.bidPrice) > 0;
          } else {
            isHighest = order.offerPrice.multiply(this.highest.bidPrice).compareTo(Amount.ONE) < 0;
          }
        } else {
          if (order.offerPrice) {
            isHighest = order.offerPrice.compareTo(this.highest.offerPrice) < 0;
          } else {
            isHighest = order.bidPrice.multiply(this.highest.offerPrice).compareTo(Amount.ONE) > 0;
          }
        }
        if (isHighest) {
          this.highest.add(order);
          this.highest = order;
        } else {
          nextHigher = this.head.add(order);
        }
      } else {
        this.head = order;
        this.highest = order;
      }
      return nextHigher;
    };

    Book.prototype.cancel = function(order) {
      var newHead, parent;
      newHead = order["delete"]();
      if (this.highest === order) {
        if (newHead) {
          this.highest = newHead.getHighest();
        } else {
          parent = order.lowerParent;
          if (parent) {
            this.highest = parent;
          } else {
            delete this.highest;
          }
        }
      }
      if (order === this.head) {
        if (newHead) {
          return this.head = newHead;
        } else {
          return delete this.head;
        }
      }
    };

    Book.prototype.next = function() {
      return this.highest;
    };

    Book.prototype.toJSON = function() {
      var next, _results;
      next = this;
      _results = [];
      while (next = next.next()) {
        _results.push(next);
      }
      return _results;
    };

    return Book;

  })();

}).call(this);
