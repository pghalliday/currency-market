(function() {
  var Book, equals, exportOrders, findHighest, higherEquals, insert, insertLowest, lowerEquals, parentEquals, unexportOrders,
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
      head.lower = order;
      return order.parent = head;
    } else {
      return insertLowest(head.lower, order);
    }
  };

  exportOrders = function(head) {
    var state;

    state = Object.create(null);
    state.order = head.id;
    if (typeof head.higher !== 'undefined') {
      state.higher = exportOrders(head.higher);
    }
    if (typeof head.lower !== 'undefined') {
      state.lower = exportOrders(head.lower);
    }
    return state;
  };

  unexportOrders = function(head, orders) {
    var order;

    order = orders[head.order];
    if (typeof head.higher !== 'undefined') {
      order.higher = unexportOrders(head.higher, orders);
      order.higher.parent = order;
    }
    if (typeof head.lower !== 'undefined') {
      order.lower = unexportOrders(head.lower, orders);
      order.lower.parent = order;
    }
    return order;
  };

  parentEquals = function(left, right) {
    if (typeof left.parent === 'undefined') {
      if (typeof right.parent === 'undefined') {
        return true;
      } else {
        return false;
      }
    } else {
      if (typeof right.parent === 'undefined') {
        return false;
      } else {
        return left.parent.equals(right.parent);
      }
    }
  };

  lowerEquals = function(left, right) {
    if (typeof left.lower === 'undefined') {
      if (typeof right.lower === 'undefined') {
        return true;
      } else {
        return false;
      }
    } else {
      if (typeof right.lower === 'undefined') {
        return false;
      } else {
        return equals(left.lower, right.lower);
      }
    }
  };

  higherEquals = function(left, right) {
    if (typeof left.higher === 'undefined') {
      if (typeof right.higher === 'undefined') {
        return true;
      } else {
        return false;
      }
    } else {
      if (typeof right.higher === 'undefined') {
        return false;
      } else {
        return equals(left.higher, right.higher);
      }
    }
  };

  equals = function(left, right) {
    if (parentEquals(left, right)) {
      if (lowerEquals(left, right)) {
        if (higherEquals(left, right)) {
          if (left.equals(right)) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  module.exports = Book = (function() {
    function Book(params) {
      this.equals = __bind(this.equals, this);
      this["delete"] = __bind(this["delete"], this);
      this.add = __bind(this.add, this);
      this["export"] = __bind(this["export"], this);      if (typeof params !== 'undefined') {
        if (typeof params.state.head !== 'undefined') {
          this.head = unexportOrders(params.state.head, params.orders);
          this.highest = findHighest(this.head);
        }
      }
    }

    Book.prototype["export"] = function() {
      var state;

      state = Object.create(null);
      if (typeof this.head !== 'undefined') {
        state.head = exportOrders(this.head);
      }
      return state;
    };

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

    Book.prototype.equals = function(book) {
      if (typeof this.highest === 'undefined') {
        if (typeof book.highest === 'undefined') {
          if (typeof this.head === 'undefined') {
            if (typeof book.head === 'undefined') {
              return true;
            } else {
              return false;
            }
          } else {
            if (typeof book.head === 'undefined') {
              return false;
            } else {
              return equals(this.head, book.head);
            }
          }
        } else {
          return false;
        }
      } else {
        if (typeof book.highest === 'undefined') {
          return false;
        } else {
          if (this.highest.equals(book.highest)) {
            if (typeof this.head === 'undefined') {
              if (typeof book.head === 'undefined') {
                return true;
              } else {
                return false;
              }
            } else {
              if (typeof book.head === 'undefined') {
                return false;
              } else {
                return equals(this.head, book.head);
              }
            }
          } else {
            return false;
          }
        }
      }
    };

    return Book;

  })();

}).call(this);
