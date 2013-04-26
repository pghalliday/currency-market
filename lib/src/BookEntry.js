(function() {
  var BookEntry, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Order = require('./Order');

  module.exports = BookEntry = (function() {
    function BookEntry(params) {
      this.equals = __bind(this.equals, this);
      this.getHighest = __bind(this.getHighest, this);
      this["delete"] = __bind(this["delete"], this);
      this.addLowest = __bind(this.addLowest, this);
      this.add = __bind(this.add, this);
      this["export"] = __bind(this["export"], this);      if (params.state) {
        this.order = new Order({
          state: params.state.order
        });
        params.entries[this.order.id] = this;
        if (params.state.lower) {
          this.lower = new BookEntry({
            state: params.state.lower,
            entries: params.entries
          });
          this.lower.parent = this;
        }
        if (params.state.higher) {
          this.higher = new BookEntry({
            state: params.state.higher,
            entries: params.entries
          });
          this.higher.parent = this;
        }
      } else {
        if (params.order) {
          this.order = params.order;
        } else {
          throw new Error('Must supply an order');
        }
      }
    }

    BookEntry.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      state.order = this.order["export"]();
      if (this.lower) {
        state.lower = this.lower["export"]();
      }
      if (this.higher) {
        state.higher = this.higher["export"]();
      }
      return state;
    };

    BookEntry.prototype.add = function(bookEntry) {
      if (bookEntry.order.bidPrice.compareTo(this.order.bidPrice) > 0) {
        if (this.higher) {
          return this.higher.add(bookEntry);
        } else {
          this.higher = bookEntry;
          return bookEntry.parent = this;
        }
      } else {
        if (this.lower) {
          return this.lower.add(bookEntry);
        } else {
          this.lower = bookEntry;
          return bookEntry.parent = this;
        }
      }
    };

    BookEntry.prototype.addLowest = function(bookEntry) {
      if (this.lower) {
        return this.lower.addLowest(bookEntry);
      } else {
        this.lower = bookEntry;
        return bookEntry.parent = this;
      }
    };

    BookEntry.prototype["delete"] = function() {
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

    BookEntry.prototype.getHighest = function() {
      if (this.higher) {
        return this.higher.getHighest();
      } else {
        return this;
      }
    };

    BookEntry.prototype.equals = function(bookEntry) {
      if (this.order.equals(bookEntry.order)) {
        if (this.higher) {
          if (bookEntry.higher) {
            if (!this.higher.equals(bookEntry.higher)) {
              return false;
            }
          } else {
            return false;
          }
        } else if (bookEntry.higher) {
          return false;
        }
        if (this.lower) {
          if (bookEntry.lower) {
            if (!this.lower.equals(bookEntry.lower)) {
              return false;
            }
          } else {
            return false;
          }
        } else if (bookEntry.lower) {
          return false;
        }
      } else {
        return false;
      }
      return true;
    };

    return BookEntry;

  })();

}).call(this);
