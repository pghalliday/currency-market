(function() {
  var Account, Amount, Book, EventEmitter, Market, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Account = require('./Account');

  Book = require('./Book');

  Order = require('./Order');

  Amount = require('./Amount');

  EventEmitter = require('events').EventEmitter;

  module.exports = Market = (function(_super) {
    var execute;

    __extends(Market, _super);

    function Market(params) {
      this.equals = __bind(this.equals, this);
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.register = __bind(this.register, this);
      this["export"] = __bind(this["export"], this);
      var _this = this;

      this.accounts = Object.create(null);
      this.books = Object.create(null);
      this.orders = Object.create(null);
      if (params.state) {
        this.lastTransaction = params.state.lastTransaction;
        this.currencies = params.state.currencies;
        Object.keys(params.state.books).forEach(function(bidCurrency) {
          _this.books[bidCurrency] = Object.create(null);
          return Object.keys(params.state.books[bidCurrency]).forEach(function(offerCurrency) {
            return _this.books[bidCurrency][offerCurrency] = new Book({
              state: params.state.books[bidCurrency][offerCurrency],
              orders: _this.orders
            });
          });
        });
        Object.keys(params.state.accounts).forEach(function(id) {
          return _this.accounts[id] = new Account({
            state: params.state.accounts[id],
            orders: _this.orders
          });
        });
      } else {
        this.currencies = params.currencies;
        this.currencies.forEach(function(offerCurrency) {
          _this.books[offerCurrency] = Object.create(null);
          return _this.currencies.forEach(function(bidCurrency) {
            if (bidCurrency !== offerCurrency) {
              return _this.books[offerCurrency][bidCurrency] = new Book();
            }
          });
        });
      }
    }

    Market.prototype["export"] = function() {
      var state,
        _this = this;

      state = Object.create(null);
      state.lastTransaction = this.lastTransaction;
      state.currencies = this.currencies;
      state.accounts = Object.create(null);
      state.books = Object.create(null);
      Object.keys(this.accounts).forEach(function(id) {
        return state.accounts[id] = _this.accounts[id]["export"]();
      });
      Object.keys(this.books).forEach(function(bidCurrency) {
        state.books[bidCurrency] = Object.create(null);
        return Object.keys(_this.books[bidCurrency]).forEach(function(offerCurrency) {
          return state.books[bidCurrency][offerCurrency] = _this.books[bidCurrency][offerCurrency]["export"]();
        });
      });
      return state;
    };

    Market.prototype.register = function(account) {
      if (this.accounts[account.id]) {
        throw new Error('Account already exists');
      } else {
        this.accounts[account.id] = account;
        this.lastTransaction = account.id;
        return this.emit('account', account);
      }
    };

    Market.prototype.deposit = function(deposit) {
      var account, balance;

      if (typeof deposit.id === 'undefined') {
        throw new Error('Must supply transaction ID');
      } else {
        if (typeof deposit.timestamp === 'undefined') {
          throw new Error('Must supply timestamp');
        } else {
          account = this.accounts[deposit.account];
          if (typeof account === 'undefined') {
            throw new Error('Account does not exist');
          } else {
            balance = account.balances[deposit.currency];
            if (typeof balance === 'undefined') {
              throw new Error('Currency is not supported');
            } else {
              balance.deposit(deposit.amount);
              this.lastTransaction = deposit.id;
              return this.emit('deposit', deposit);
            }
          }
        }
      }
    };

    Market.prototype.withdraw = function(withdrawal) {
      var account, balance;

      if (typeof withdrawal.id === 'undefined') {
        throw new Error('Must supply transaction ID');
      } else {
        if (typeof withdrawal.timestamp === 'undefined') {
          throw new Error('Must supply timestamp');
        } else {
          account = this.accounts[withdrawal.account];
          if (typeof account === 'undefined') {
            throw new Error('Account does not exist');
          } else {
            balance = account.balances[withdrawal.currency];
            if (typeof balance === 'undefined') {
              throw new Error('Currency is not supported');
            } else {
              balance.withdraw(withdrawal.amount);
              this.lastTransaction = withdrawal.id;
              return this.emit('withdrawal', withdrawal);
            }
          }
        }
      }
    };

    execute = function(leftBook, rightBook) {
      var leftOrder, rightOrder, tryAgain;

      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (typeof leftOrder !== 'undefined' && typeof rightOrder !== 'undefined') {
        tryAgain = leftOrder.match(rightOrder);
        if (tryAgain) {
          return execute(leftBook, rightBook);
        }
      }
    };

    Market.prototype.submit = function(order) {
      var account, book, books,
        _this = this;

      account = this.accounts[order.account];
      if (typeof account === 'undefined') {
        throw new Error('Account does not exist');
      } else {
        books = this.books[order.bidCurrency];
        if (typeof books === 'undefined') {
          throw new Error('Bid currency is not supported');
        } else {
          book = books[order.offerCurrency];
          if (typeof book === 'undefined') {
            throw new Error('Offer currency is not supported');
          } else {
            account.submit(order);
            book.submit(order);
            this.orders[order.id] = order;
            order.on('done', function(fill) {
              return delete _this.orders[order.id];
            });
            this.lastTransaction = order.id;
            order.on('trade', function(trade) {
              return _this.emit('trade', trade);
            });
            this.emit('order', order);
            return execute(book, this.books[order.offerCurrency][order.bidCurrency]);
          }
        }
      }
    };

    Market.prototype.cancel = function(cancellation) {
      var order;

      order = this.orders[cancellation.order];
      if (order) {
        delete this.orders[cancellation.order];
        this.books[order.bidCurrency][order.offerCurrency].cancel(order);
        this.accounts[order.account].cancel(order);
        this.lastTransaction = cancellation.id;
        return this.emit('cancellation', cancellation);
      } else {
        throw new Error('Order cannot be found');
      }
    };

    Market.prototype.equals = function(market) {
      var equal,
        _this = this;

      equal = true;
      if (typeof this.lastTransaction === 'undefined') {
        if (typeof market.lastTransaction !== 'undefined') {
          equal = false;
        }
      } else {
        if (this.lastTransaction !== market.lastTransaction) {
          equal = false;
        }
      }
      if (equal) {
        Object.keys(this.orders).forEach(function(id) {
          if (market.orders[id]) {
            if (!(_this.orders[id].equals(market.orders[id]))) {
              return equal = false;
            }
          } else {
            return equal = false;
          }
        });
        if (equal) {
          Object.keys(market.orders).forEach(function(id) {
            if (!_this.orders[id]) {
              return equal = false;
            }
          });
          if (equal) {
            this.currencies.forEach(function(currency) {
              if (market.currencies.indexOf(currency) === -1) {
                return equal = false;
              }
            });
            if (equal) {
              market.currencies.forEach(function(currency) {
                if (_this.currencies.indexOf(currency) === -1) {
                  return equal = false;
                }
              });
              if (equal) {
                Object.keys(this.accounts).forEach(function(id) {
                  if (!market.accounts[id]) {
                    return equal = false;
                  }
                });
                if (equal) {
                  Object.keys(market.accounts).forEach(function(id) {
                    if (!_this.accounts[id]) {
                      return equal = false;
                    } else {
                      if (!_this.accounts[id].equals(market.accounts[id])) {
                        return equal = false;
                      }
                    }
                  });
                  if (equal) {
                    Object.keys(this.books).forEach(function(bidCurrency) {
                      if (Object.keys(market.books).indexOf(bidCurrency) === -1) {
                        return equal = false;
                      }
                    });
                    if (equal) {
                      Object.keys(market.books).forEach(function(bidCurrency) {
                        if (Object.keys(_this.books).indexOf(bidCurrency) === -1) {
                          return equal = false;
                        } else {
                          Object.keys(_this.books[bidCurrency]).forEach(function(offerCurrency) {
                            if (Object.keys(market.books[bidCurrency]).indexOf(offerCurrency) === -1) {
                              return equal = false;
                            }
                          });
                          if (equal) {
                            return Object.keys(market.books[bidCurrency]).forEach(function(offerCurrency) {
                              if (Object.keys(_this.books[bidCurrency]).indexOf(offerCurrency) === -1) {
                                return equal = false;
                              } else {
                                if (!_this.books[bidCurrency][offerCurrency].equals(market.books[bidCurrency][offerCurrency])) {
                                  return equal = false;
                                }
                              }
                            });
                          }
                        }
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
      return equal;
    };

    return Market;

  })(EventEmitter);

}).call(this);
