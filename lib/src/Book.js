(function() {
  var Amount, Book,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('./Amount');

  module.exports = Book = (function() {
    function Book() {
      this["export"] = __bind(this["export"], this);
      this.next = __bind(this.next, this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
    }

    Book.prototype.submit = function(order) {
      var isHighest,
        _this = this;
      if (this.head) {
        if (order.bidPrice) {
          isHighest = order.bidPrice.compareTo(this.highest.bidPrice) > 0;
        } else {
          isHighest = order.offerPrice.compareTo(this.highest.offerPrice) < 0;
        }
        if (isHighest) {
          this.highest.add(order);
          this.highest = order;
        } else {
          this.head.add(order);
        }
      } else {
        this.head = order;
        this.highest = order;
      }
      return order.on('done', function() {
        return _this.cancel(order);
      });
    };

    Book.prototype.cancel = function(order) {
      var newHead, parent;
      parent = order.parent;
      newHead = order["delete"]();
      if (this.highest === order) {
        if (newHead) {
          this.highest = newHead.getHighest();
        } else {
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

    Book.prototype["export"] = function() {
      var next, _results;
      next = this;
      _results = [];
      while (next = next.next()) {
        _results.push(next["export"]());
      }
      return _results;
    };

    return Book;

  })();

}).call(this);
