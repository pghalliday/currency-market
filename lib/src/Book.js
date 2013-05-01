(function() {
  var Book, BookEntry,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BookEntry = require('./BookEntry');

  module.exports = Book = (function() {
    function Book(params) {
      this.equals = __bind(this.equals, this);
      this["delete"] = __bind(this["delete"], this);
      this.add = __bind(this.add, this);
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

    Book.prototype.add = function(order) {
      var entry, highestEntry, isHighest;

      entry = new BookEntry({
        order: order
      });
      this.entries[order.id] = entry;
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

    Book.prototype["delete"] = function(order) {
      var entry, newHead, parent;

      entry = this.entries[order.id];
      if (!entry) {
        throw new Error('Order cannot be found');
      } else {
        if (entry.order.equals(order)) {
          delete this.entries[order.id];
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
