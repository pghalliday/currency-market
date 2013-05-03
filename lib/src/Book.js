(function() {
  var Amount, Book, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Amount = require('./Amount');

  Order = require('./Order');

  module.exports = Book = (function() {
    function Book(params) {
      this.equals = __bind(this.equals, this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this["export"] = __bind(this["export"], this);
      var id, order, _ref,
        _this = this;

      if (params) {
        if (params.state.head) {
          this.head = new Order({
            state: params.state.head,
            orders: params.orders
          });
          this.highest = this.head.getHighest();
          _ref = params.orders;
          for (id in _ref) {
            order = _ref[id];
            order.on('done', function() {
              return _this.cancel(order);
            });
          }
        }
      }
    }

    Book.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      if (this.head) {
        state.head = this.head["export"]();
      }
      return state;
    };

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

    Book.prototype.equals = function(book) {
      if (this.head) {
        if (book.head) {
          if (!this.head.equals(book.head)) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (book.head) {
          return false;
        }
      }
      if (this.highest) {
        if (book.highest) {
          if (!this.highest.equals(book.highest)) {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (book.highest) {
          return false;
        }
      }
      return true;
    };

    return Book;

  })();

}).call(this);
