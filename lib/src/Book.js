(function() {
  var Book, findHighest, insert, insertLowest,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  insert = function(head, order) {
    if (order.bidPrice.compareTo(head.bidPrice) > 0) {
      if (typeof head.higher === 'undefined') {
        head.higher = order;
        return order.parent = head;
      } else {
        return insert(head.higher, order);
      }
    } else {
      if (typeof head.lower === 'undefined') {
        head.lower = order;
        return order.parent = head;
      } else {
        return insert(head.lower, order);
      }
    }
  };

  findHighest = function(order) {
    if (typeof order.higher === 'undefined') {
      return order;
    } else {
      return findHighest(order.higher);
    }
  };

  insertLowest = function(head, order) {
    if (typeof head.lower === 'undefined') {
      return head.lower = order;
    } else {
      return insertLowest(head.lower, order);
    }
  };

  module.exports = Book = (function() {
    function Book() {
      this["delete"] = __bind(this["delete"], this);
      this.add = __bind(this.add, this);
    }

    Book.prototype.add = function(order) {
      if (typeof this.head === 'undefined') {
        this.head = order;
        return this.highest = order;
      } else {
        if (order.bidPrice.compareTo(this.highest.bidPrice) > 0) {
          this.highest.higher = order;
          order.parent = this.highest;
          return this.highest = order;
        } else {
          return insert(this.head, order);
        }
      }
    };

    Book.prototype["delete"] = function(order) {
      var parent;

      parent = order.parent;
      if (typeof parent === 'undefined') {
        if (typeof order.higher === 'undefined') {
          if (typeof order.lower === 'undefined') {
            delete this.head;
            return delete this.highest;
          } else {
            this.head = order.lower;
            delete this.head.parent;
            return this.highest = findHighest(this.head);
          }
        } else {
          this.head = order.higher;
          delete this.head.parent;
          if (typeof order.lower !== 'undefined') {
            return insertLowest(this.head, order.lower);
          }
        }
      } else {
        if (parent.lower === order) {
          if (typeof order.higher === 'undefined') {
            if (typeof order.lower === 'undefined') {
              return delete parent.lower;
            } else {
              parent.lower = order.lower;
              return parent.lower.parent = parent;
            }
          } else {
            parent.lower = order.higher;
            parent.lower.parent = parent;
            if (typeof order.lower !== 'undefined') {
              return insertLowest(parent.lower, order.lower);
            }
          }
        } else if (parent.higher === order) {
          if (typeof order.higher === 'undefined') {
            if (typeof order.lower === 'undefined') {
              delete parent.higher;
              if (this.highest === order) {
                return this.highest = parent;
              }
            } else {
              parent.higher = order.lower;
              parent.higher.parent = parent;
              if (this.highest === order) {
                return this.highest = findHighest(order.lower);
              }
            }
          } else {
            parent.higher = order.higher;
            parent.higher.parent = parent;
            if (typeof order.lower !== 'undefined') {
              return insertLowest(parent.higher, order.lower);
            }
          }
        } else {
          throw new Error('Binary tree seems to be broken!');
        }
      }
    };

    return Book;

  })();

}).call(this);
