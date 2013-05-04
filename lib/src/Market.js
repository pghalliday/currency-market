(function() {
  var Book, EventEmitter, Market,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Book = require('./Book');

  EventEmitter = require('events').EventEmitter;

  module.exports = Market = (function(_super) {
    var execute;

    __extends(Market, _super);

    function Market(params) {
      this.cancel = __bind(this.cancel, this);
      this.submit = __bind(this.submit, this);
      this.withdraw = __bind(this.withdraw, this);
      this.deposit = __bind(this.deposit, this);
      this.register = __bind(this.register, this);
      var _this = this;

      this.accounts = Object.create(null);
      this.books = Object.create(null);
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

      if (deposit.id) {
        if (deposit.timestamp) {
          account = this.accounts[deposit.account];
          if (account) {
            balance = account.balances[deposit.currency];
            if (balance) {
              balance.deposit(deposit.amount);
              this.lastTransaction = deposit.id;
              return this.emit('deposit', deposit);
            } else {
              throw new Error('Currency is not supported');
            }
          } else {
            throw new Error('Account does not exist');
          }
        } else {
          throw new Error('Must supply timestamp');
        }
      } else {
        throw new Error('Must supply transaction ID');
      }
    };

    Market.prototype.withdraw = function(withdrawal) {
      var account, balance;

      if (withdrawal.id) {
        if (withdrawal.timestamp) {
          account = this.accounts[withdrawal.account];
          if (account) {
            balance = account.balances[withdrawal.currency];
            if (balance) {
              balance.withdraw(withdrawal.amount);
              this.lastTransaction = withdrawal.id;
              return this.emit('withdrawal', withdrawal);
            } else {
              throw new Error('Currency is not supported');
            }
          } else {
            throw new Error('Account does not exist');
          }
        } else {
          throw new Error('Must supply timestamp');
        }
      } else {
        throw new Error('Must supply transaction ID');
      }
    };

    execute = function(leftBook, rightBook) {
      var leftOrder, rightOrder, tryAgain;

      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (leftOrder && rightOrder) {
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
      if (account) {
        books = this.books[order.bidCurrency];
        if (books) {
          book = books[order.offerCurrency];
          if (book) {
            account.submit(order);
            book.submit(order);
            this.lastTransaction = order.id;
            order.on('trade', function(trade) {
              return _this.emit('trade', trade);
            });
            this.emit('order', order);
            return execute(book, this.books[order.offerCurrency][order.bidCurrency]);
          } else {
            throw new Error('Offer currency is not supported');
          }
        } else {
          throw new Error('Bid currency is not supported');
        }
      } else {
        throw new Error('Account does not exist');
      }
    };

    Market.prototype.cancel = function(cancellation) {
      var order;

      order = this.accounts[cancellation.order.account].balances[cancellation.order.offerCurrency].offers[cancellation.order.id];
      if (order) {
        this.books[order.bidCurrency][order.offerCurrency].cancel(order);
        this.accounts[order.account].cancel(order);
        this.lastTransaction = cancellation.id;
        return this.emit('cancellation', cancellation);
      } else {
        throw new Error('Order cannot be found');
      }
    };

    return Market;

  })(EventEmitter);

}).call(this);
