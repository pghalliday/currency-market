(function() {
  var Amount, Book, BookEntry,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BookEntry = require('./BookEntry');

  Amount = require('./Amount');

  module.exports = Book = (function() {
    var deleteEntry;

    function Book(params) {
      this.equals = __bind(this.equals, this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this["export"] = __bind(this["export"], this);      this.entries = Object.create(null);
      if (typeof params !== 'undefined') {
        if (typeof params.state.head !== 'undefined') {
          this.head = new BookEntry({
            state: params.state.head,
            orders: params.orders,
            entries: this.entries
          });
          this.highest = this.head.getHighest().order;
        }
      }
    }

    Book.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      if (typeof this.head !== 'undefined') {
        state.head = this.head["export"]();
      }
      return state;
    };

    deleteEntry = function(entry) {
      var newHead, parent;

      delete this.entries[entry.order.id];
      parent = entry.parent;
      newHead = entry["delete"]();
      if (this.highest === entry.order) {
        if (newHead) {
          this.highest = newHead.getHighest().order;
        } else {
          if (parent) {
            this.highest = parent.order;
          } else {
            delete this.highest;
          }
        }
      }
      if (entry === this.head) {
        if (newHead) {
          return this.head = newHead;
        } else {
          return delete this.head;
        }
      }
    };

    Book.prototype.submit = function(order) {
      var entry, highestEntry, isHighest,
        _this = this;

      entry = new BookEntry({
        order: order
      });
      this.entries[order.id] = entry;
      order.on('fill', function(fill) {
        if (order.bidAmount.compareTo(Amount.ZERO) === 0) {
          return deleteEntry.call(_this, entry);
        }
      });
      if (this.head) {
        if (order.bidPrice) {
          isHighest = order.bidPrice.compareTo(this.highest.bidPrice) > 0;
        } else {
          isHighest = order.offerPrice.compareTo(this.highest.offerPrice) < 0;
        }
        if (isHighest) {
          highestEntry = this.entries[this.highest.id];
          highestEntry.add(entry);
          return this.highest = order;
        } else {
          return this.head.add(entry);
        }
      } else {
        this.head = entry;
        return this.highest = order;
      }
    };

    Book.prototype.cancel = function(order) {
      var entry;

      entry = this.entries[order.id];
      if (!entry) {
        throw new Error('Order cannot be found');
      } else {
        if (entry.order.equals(order)) {
          return deleteEntry.call(this, entry);
        } else {
          throw new Error('Order does not match');
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
