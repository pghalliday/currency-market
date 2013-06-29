(function() {
  var Account, Amount, Book, Engine, Order,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Book = require('./Book');

  Account = require('./Account');

  Amount = require('../Amount');

  Order = require('./Order');

  module.exports = Engine = (function() {
    function Engine(params) {
      this["import"] = __bind(this["import"], this);
      this["export"] = __bind(this["export"], this);
      this.execute = __bind(this.execute, this);
      this.apply = __bind(this.apply, this);
      this.getBook = __bind(this.getBook, this);
      this.getAccount = __bind(this.getAccount, this);      this.nextOperationSequence = 0;
      this.nextDeltaSequence = 0;
      this.accounts = Object.create(null);
      this.books = Object.create(null);
      if (params) {
        if (params.commission) {
          this.commission = {
            account: this.getAccount(params.commission.account),
            calculate: params.commission.calculate
          };
        }
      }
    }

    Engine.prototype.getAccount = function(id) {
      var account;

      account = this.accounts[id];
      if (!account) {
        this.accounts[id] = account = new Account({
          id: id,
          commission: this.commission
        });
      }
      return account;
    };

    Engine.prototype.getBook = function(bidCurrency, offerCurrency) {
      var book, books;

      books = this.books[bidCurrency];
      if (!books) {
        this.books[bidCurrency] = books = Object.create(null);
      }
      book = books[offerCurrency];
      if (!book) {
        books[offerCurrency] = book = new Book({
          bidCurrency: bidCurrency,
          offerCurrency: offerCurrency
        });
      }
      return book;
    };

    Engine.prototype.apply = function(operation) {
      var account, leftBook, nextHigher, order, result, rightBook, submit;

      if (typeof operation.sequence !== 'undefined') {
        if (operation.sequence === this.nextOperationSequence) {
          this.nextOperationSequence++;
          if (typeof operation.timestamp !== 'undefined') {
            account = this.getAccount(operation.account);
            result = Object.create(null);
            if (operation.deposit) {
              account.deposit(operation.deposit);
            } else if (operation.withdraw) {
              account.withdraw(operation.withdraw);
            } else if (operation.submit) {
              result.nextHigherOrderSequence = -1;
              submit = operation.submit;
              leftBook = this.getBook(submit.bidCurrency, submit.offerCurrency);
              order = new Order({
                sequence: operation.sequence,
                timestamp: operation.timestamp,
                account: account,
                book: leftBook,
                bidPrice: submit.bidPrice,
                bidAmount: submit.bidAmount,
                offerPrice: submit.offerPrice,
                offerAmount: submit.offerAmount
              });
              account.submit(order);
              nextHigher = leftBook.submit(order);
              if (nextHigher) {
                result.nextHigherOrderSequence = nextHigher.sequence;
              }
              rightBook = this.getBook(submit.offerCurrency, submit.bidCurrency);
              result.trades = [];
              this.execute(result.trades, leftBook, rightBook);
            } else if (operation.cancel) {
              order = account.cancel(operation.cancel.sequence);
              this.getBook(order.bidBalance.currency, order.offerBalance.currency).cancel(order);
            } else {
              throw new Error('Unknown operation');
            }
            result.sequence = this.nextDeltaSequence++;
            return result;
          } else {
            throw new Error('Must supply a timestamp');
          }
        } else {
          throw new Error('Unexpected sequence number');
        }
      } else {
        throw new Error('Must supply a sequence number');
      }
    };

    Engine.prototype.execute = function(trades, leftBook, rightBook) {
      var leftOrder, result, rightOrder;

      leftOrder = leftBook.next();
      rightOrder = rightBook.next();
      if (leftOrder && rightOrder) {
        result = leftOrder.match(rightOrder);
        if (result.trade) {
          trades.push({
            left: {
              newBidAmount: leftOrder.bidAmount,
              newOfferAmount: leftOrder.offerAmount,
              transaction: result.trade.left
            },
            right: {
              newBidAmount: rightOrder.bidAmount,
              newOfferAmount: rightOrder.offerAmount,
              transaction: result.trade.right
            }
          });
          if (!result.complete) {
            return this.execute(trades, leftBook, rightBook);
          }
        }
      }
    };

    Engine.prototype["export"] = function() {
      var account, bidCurrency, book, books, id, object, offerCurrency, _ref, _ref1;

      object = Object.create(null);
      object.nextOperationSequence = this.nextOperationSequence;
      object.nextDeltaSequence = this.nextDeltaSequence;
      object.accounts = Object.create(null);
      _ref = this.accounts;
      for (id in _ref) {
        account = _ref[id];
        object.accounts[id] = account["export"]();
      }
      object.books = Object.create(null);
      _ref1 = this.books;
      for (bidCurrency in _ref1) {
        books = _ref1[bidCurrency];
        object.books[bidCurrency] = Object.create(null);
        for (offerCurrency in books) {
          book = books[offerCurrency];
          object.books[bidCurrency][offerCurrency] = book["export"]();
        }
      }
      return object;
    };

    Engine.prototype["import"] = function(snapshot) {
      var account, balance, bidCurrency, book, books, currency, id, offerCurrency, order, _fn, _i, _len, _ref, _ref1, _ref2,
        _this = this;

      _ref = snapshot.accounts;
      for (id in _ref) {
        account = _ref[id];
        _ref1 = account.balances;
        for (currency in _ref1) {
          balance = _ref1[currency];
          this.apply({
            account: id,
            sequence: this.nextOperationSequence,
            timestamp: 0,
            deposit: {
              currency: currency,
              amount: new Amount(balance.funds)
            }
          });
        }
      }
      _ref2 = snapshot.books;
      for (bidCurrency in _ref2) {
        books = _ref2[bidCurrency];
        for (offerCurrency in books) {
          book = books[offerCurrency];
          _fn = function(order) {
            var orderObject;

            account = _this.getAccount(order.account);
            book = _this.getBook(order.bidCurrency, order.offerCurrency);
            orderObject = new Order({
              sequence: order.sequence,
              timestamp: order.timestamp,
              account: account,
              book: book,
              bidPrice: order.bidPrice ? new Amount(order.bidPrice) : void 0,
              bidAmount: order.bidAmount ? new Amount(order.bidAmount) : void 0,
              offerPrice: order.offerPrice ? new Amount(order.offerPrice) : void 0,
              offerAmount: order.offerAmount ? new Amount(order.offerAmount) : void 0
            });
            account.submit(orderObject);
            return book.submit(orderObject);
          };
          for (_i = 0, _len = book.length; _i < _len; _i++) {
            order = book[_i];
            _fn(order);
          }
        }
      }
      this.nextOperationSequence = snapshot.nextOperationSequence;
      return this.nextDeltaSequence = snapshot.nextDeltaSequence;
    };

    return Engine;

  })();

}).call(this);
