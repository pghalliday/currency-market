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
    __extends(Market, _super);

    function Market(params) {
      this.equals = __bind(this.equals, this);
      this.cancel = __bind(this.cancel, this);
      this.execute = __bind(this.execute, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.register = __bind(this.register, this);
      this["export"] = __bind(this["export"], this);
      var _this = this;

      this.accounts = Object.create(null);
      this.books = Object.create(null);
      if (params.state) {
        this.lastTransaction = params.state.lastTransaction;
        this.currencies = params.state.currencies;
        Object.keys(params.state.accounts).forEach(function(id) {
          return _this.accounts[id] = new Account({
            state: params.state.accounts[id]
          });
        });
        Object.keys(params.state.books).forEach(function(bidCurrency) {
          _this.books[bidCurrency] = Object.create(null);
          return Object.keys(params.state.books[bidCurrency]).forEach(function(offerCurrency) {
            return _this.books[bidCurrency][offerCurrency] = new Book({
              state: params.state.books[bidCurrency][offerCurrency]
            });
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

    Market.prototype.submit = function(order) {
      var account, balance, book, books;

      account = this.accounts[order.account];
      if (typeof account === 'undefined') {
        throw new Error('Account does not exist');
      } else {
        balance = account.balances[order.offerCurrency];
        if (typeof balance === 'undefined') {
          throw new Error('Offer currency is not supported');
        } else {
          books = this.books[order.bidCurrency];
          if (typeof books === 'undefined') {
            throw new Error('Bid currency is not supported');
          } else {
            book = books[order.offerCurrency];
            balance.lock(order.offerAmount);
            book.add(order);
            this.lastTransaction = order.id;
            this.emit('order', order);
            return this.execute(book, this.books[order.offerCurrency][order.bidCurrency]);
          }
        }
      }
    };

    Market.prototype.execute = function(leftBook, rightBook) {
      var leftBalances, leftDebitAmount, leftDebitCurrency, leftOrder, price, rightBalances, rightDebitAmount, rightDebitCurrency, rightOrder;

      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (typeof leftOrder !== 'undefined' && typeof rightOrder !== 'undefined') {
        if (leftOrder.offerPrice) {
          if (rightOrder.bidPrice) {
            if (rightOrder.bidPrice.compareTo(leftOrder.offerPrice) >= 0) {
              leftBalances = this.accounts[leftOrder.account].balances;
              rightBalances = this.accounts[rightOrder.account].balances;
              leftDebitCurrency = leftOrder.offerCurrency;
              rightDebitCurrency = rightOrder.offerCurrency;
              price = rightOrder.bidPrice;
              if (leftOrder.offerAmount.compareTo(rightOrder.bidAmount) > 0) {
                leftDebitAmount = rightOrder.bidAmount;
                rightDebitAmount = rightOrder.offerAmount;
                leftBalances[leftDebitCurrency].unlock(leftDebitAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                rightBook["delete"](rightOrder);
                leftOrder.reduceOffer(leftDebitAmount);
                this.emit('trade', {
                  bid: rightOrder,
                  offer: leftOrder,
                  price: price,
                  amount: leftDebitAmount
                });
                return this.execute(leftBook, rightBook);
              } else {
                leftDebitAmount = leftOrder.offerAmount;
                rightDebitAmount = leftDebitAmount.multiply(price);
                leftBalances[leftDebitCurrency].unlock(leftDebitAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                leftBook["delete"](leftOrder);
                rightOrder.reduceBid(leftDebitAmount);
                if (rightOrder.bidAmount.compareTo(Amount.ZERO) === 0) {
                  rightBook["delete"](rightOrder);
                }
                return this.emit('trade', {
                  bid: rightOrder,
                  offer: leftOrder,
                  price: price,
                  amount: leftDebitAmount
                });
              }
            }
          } else {
            if (rightOrder.offerPrice.multiply(leftOrder.offerPrice).compareTo(Amount.ONE) <= 0) {
              leftBalances = this.accounts[leftOrder.account].balances;
              rightBalances = this.accounts[rightOrder.account].balances;
              leftDebitCurrency = leftOrder.offerCurrency;
              rightDebitCurrency = rightOrder.offerCurrency;
              price = rightOrder.offerPrice;
              if (leftOrder.offerAmount.compareTo(rightOrder.bidAmount) > 0) {
                leftDebitAmount = rightOrder.bidAmount;
                rightDebitAmount = rightOrder.offerAmount;
                leftBalances[leftDebitCurrency].unlock(leftDebitAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                rightBook["delete"](rightOrder);
                leftOrder.reduceOffer(leftDebitAmount);
                this.emit('trade', {
                  bid: leftOrder,
                  offer: rightOrder,
                  price: price,
                  amount: rightDebitAmount
                });
                return this.execute(leftBook, rightBook);
              } else {
                leftDebitAmount = leftOrder.offerAmount;
                rightDebitAmount = leftDebitAmount.divide(price);
                leftBalances[leftDebitCurrency].unlock(leftDebitAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                leftBook["delete"](leftOrder);
                rightOrder.reduceOffer(rightDebitAmount);
                if (rightOrder.bidAmount.compareTo(Amount.ZERO) === 0) {
                  rightBook["delete"](rightOrder);
                }
                return this.emit('trade', {
                  bid: leftOrder,
                  offer: rightOrder,
                  price: price,
                  amount: rightDebitAmount
                });
              }
            }
          }
        } else {
          if (rightOrder.offerPrice) {
            if (leftOrder.bidPrice.compareTo(rightOrder.offerPrice) >= 0) {
              leftBalances = this.accounts[leftOrder.account].balances;
              rightBalances = this.accounts[rightOrder.account].balances;
              leftDebitCurrency = leftOrder.offerCurrency;
              rightDebitCurrency = rightOrder.offerCurrency;
              price = rightOrder.offerPrice;
              if (leftOrder.bidAmount.compareTo(rightOrder.offerAmount) > 0) {
                rightDebitAmount = rightOrder.offerAmount;
                leftDebitAmount = rightDebitAmount.multiply(price);
                leftBalances[leftDebitCurrency].unlock(rightDebitAmount.multiply(leftOrder.bidPrice));
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                rightBook["delete"](rightOrder);
                leftOrder.reduceBid(rightDebitAmount);
                this.emit('trade', {
                  bid: leftOrder,
                  offer: rightOrder,
                  price: price,
                  amount: rightDebitAmount
                });
                return this.execute(leftBook, rightBook);
              } else {
                rightDebitAmount = leftOrder.bidAmount;
                leftDebitAmount = rightDebitAmount.multiply(price);
                leftBalances[leftDebitCurrency].unlock(leftOrder.offerAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                leftBook["delete"](leftOrder);
                rightOrder.reduceOffer(rightDebitAmount);
                if (rightOrder.bidAmount.compareTo(Amount.ZERO) === 0) {
                  rightBook["delete"](rightOrder);
                }
                return this.emit('trade', {
                  bid: leftOrder,
                  offer: rightOrder,
                  price: price,
                  amount: rightDebitAmount
                });
              }
            }
          } else {
            if (rightOrder.bidPrice.multiply(leftOrder.bidPrice).compareTo(Amount.ONE) >= 0) {
              leftBalances = this.accounts[leftOrder.account].balances;
              rightBalances = this.accounts[rightOrder.account].balances;
              leftDebitCurrency = leftOrder.offerCurrency;
              rightDebitCurrency = rightOrder.offerCurrency;
              price = rightOrder.bidPrice;
              if (leftOrder.bidAmount.compareTo(rightOrder.offerAmount) > 0) {
                leftDebitAmount = rightOrder.bidAmount;
                rightDebitAmount = rightOrder.offerAmount;
                leftBalances[leftDebitCurrency].unlock(rightOrder.offerAmount.multiply(leftOrder.bidPrice));
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                rightBook["delete"](rightOrder);
                leftOrder.reduceBid(rightDebitAmount);
                this.emit('trade', {
                  bid: rightOrder,
                  offer: leftOrder,
                  price: price,
                  amount: leftDebitAmount
                });
                return this.execute(leftBook, rightBook);
              } else {
                leftDebitAmount = leftOrder.bidAmount.divide(price);
                rightDebitAmount = leftOrder.bidAmount;
                leftBalances[leftDebitCurrency].unlock(leftOrder.offerAmount);
                leftBalances[leftDebitCurrency].withdraw(leftDebitAmount);
                rightBalances[leftDebitCurrency].deposit(leftDebitAmount);
                rightBalances[rightDebitCurrency].unlock(rightDebitAmount);
                rightBalances[rightDebitCurrency].withdraw(rightDebitAmount);
                leftBalances[rightDebitCurrency].deposit(rightDebitAmount);
                leftBook["delete"](leftOrder);
                rightOrder.reduceBid(leftDebitAmount);
                if (rightOrder.bidAmount.compareTo(Amount.ZERO) === 0) {
                  rightBook["delete"](rightOrder);
                }
                return this.emit('trade', {
                  bid: rightOrder,
                  offer: leftOrder,
                  price: price,
                  amount: leftDebitAmount
                });
              }
            }
          }
        }
      }
    };

    Market.prototype.cancel = function(cancellation) {
      var order;

      order = cancellation.order;
      this.books[order.bidCurrency][order.offerCurrency]["delete"](order);
      this.accounts[order.account].balances[order.offerCurrency].unlock(order.offerAmount);
      this.lastTransaction = cancellation.id;
      return this.emit('cancellation', cancellation);
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
              if (Object.keys(market.accounts).indexOf(id) === -1) {
                return equal = false;
              }
            });
            if (equal) {
              Object.keys(market.accounts).forEach(function(id) {
                if (Object.keys(_this.accounts).indexOf(id) === -1) {
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
      return equal;
    };

    return Market;

  })(EventEmitter);

}).call(this);
