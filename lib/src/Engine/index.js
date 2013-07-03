(function() {
  var Account, Amount, Book, CancelResult, Delta, DepositResult, Engine, Order, WithdrawResult,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Book = require('./Book');

  Account = require('./Account');

  Amount = require('../Amount');

  Order = require('./Order');

  Delta = require('../Delta');

  DepositResult = require('../Delta/DepositResult');

  WithdrawResult = require('../Delta/WithdrawResult');

  CancelResult = require('../Delta/CancelResult');

  CancelResult = require('../Delta/SubmitResult');

  module.exports = Engine = (function() {
    function Engine(params) {
      this.toJSON = __bind(this.toJSON, this);
      this.execute = __bind(this.execute, this);
      this.apply = __bind(this.apply, this);
      this.getBook = __bind(this.getBook, this);
      this.getAccount = __bind(this.getAccount, this);
      var account, accountObject, balance, bidCurrency, book, books, currency, id, offerCurrency, order, state, _fn, _i, _len, _ref, _ref1, _ref2,
        _this = this;
      this.nextOperationSequence = 0;
      this.nextDeltaSequence = 0;
      this.accounts = {};
      this.books = {};
      if (params) {
        if (params.commission) {
          this.commission = {
            account: this.getAccount(params.commission.account),
            calculate: params.commission.calculate
          };
        }
        if (params.state) {
          state = params.state;
          _ref = state.accounts;
          for (id in _ref) {
            account = _ref[id];
            accountObject = this.getAccount(id);
            _ref1 = account.balances;
            for (currency in _ref1) {
              balance = _ref1[currency];
              accountObject.deposit({
                currency: currency,
                amount: new Amount(balance.funds)
              });
            }
          }
          _ref2 = state.books;
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
          this.nextOperationSequence = state.nextOperationSequence;
          this.nextDeltaSequence = state.nextDeltaSequence;
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
        this.books[bidCurrency] = books = {};
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
      var account, delta, deposit, leftBook, lockedFunds, nextHigher, order, rightBook, submit, withdraw;
      if (typeof operation.sequence !== 'undefined') {
        if (operation.sequence === this.nextOperationSequence) {
          this.nextOperationSequence++;
          if (typeof operation.timestamp !== 'undefined') {
            account = this.getAccount(operation.account);
            if (operation.deposit) {
              deposit = operation.deposit;
              delta = new Delta({
                sequence: this.nextDeltaSequence,
                operation: operation,
                result: new DepositResult({
                  funds: account.deposit({
                    currency: deposit.currency,
                    amount: deposit.amount ? new Amount(deposit.amount) : void 0
                  })
                })
              });
            } else if (operation.withdraw) {
              withdraw = operation.withdraw;
              delta = new Delta({
                sequence: this.nextDeltaSequence,
                operation: operation,
                result: new WithdrawResult({
                  funds: account.withdraw({
                    currency: withdraw.currency,
                    amount: withdraw.amount ? new Amount(withdraw.amount) : void 0
                  })
                })
              });
            } else if (operation.submit) {
              submit = operation.submit;
              leftBook = this.getBook(submit.bidCurrency, submit.offerCurrency);
              order = new Order({
                sequence: operation.sequence,
                timestamp: operation.timestamp,
                account: account,
                book: leftBook,
                bidPrice: submit.bidPrice ? new Amount(submit.bidPrice) : void 0,
                bidAmount: submit.bidAmount ? new Amount(submit.bidAmount) : void 0,
                offerPrice: submit.offerPrice ? new Amount(submit.offerPrice) : void 0,
                offerAmount: submit.offerAmount ? new Amount(submit.offerAmount) : void 0
              });
              lockedFunds = account.submit(order);
              nextHigher = leftBook.submit(order);
              if (nextHigher) {
                delta = new Delta({
                  sequence: this.nextDeltaSequence,
                  operation: operation,
                  result: {
                    lockedFunds: lockedFunds,
                    nextHigherOrderSequence: nextHigher.sequence
                  }
                });
              } else {
                rightBook = this.getBook(submit.offerCurrency, submit.bidCurrency);
                delta = new Delta({
                  sequence: this.nextDeltaSequence,
                  operation: operation,
                  result: {
                    lockedFunds: lockedFunds,
                    trades: this.execute([], leftBook, rightBook)
                  }
                });
              }
            } else if (operation.cancel) {
              order = account.getOrder(operation.cancel.sequence);
              delta = new Delta({
                sequence: this.nextDeltaSequence,
                operation: operation,
                result: new CancelResult({
                  lockedFunds: account.cancel(order)
                })
              });
              this.getBook(order.bidBalance.currency, order.offerBalance.currency).cancel(order);
            } else {
              throw new Error('Unknown operation');
            }
            this.nextDeltaSequence++;
            return delta;
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
      var leftOrder, rightOrder, trade;
      leftOrder = leftBook.highest;
      rightOrder = rightBook.highest;
      if (leftOrder && rightOrder) {
        trade = leftOrder.match(rightOrder);
        if (trade) {
          trades.push(trade);
          if (trade.left.remainder) {
            this.execute(trades, leftBook, rightBook);
          }
        }
      }
      return trades;
    };

    Engine.prototype.toJSON = function() {
      var object;
      return object = {
        nextOperationSequence: this.nextOperationSequence,
        nextDeltaSequence: this.nextDeltaSequence,
        accounts: this.accounts,
        books: this.books
      };
    };

    return Engine;

  })();

}).call(this);
